import * as authRepository from "./auth.repository.js";
import { hashPassword, verifyPassword } from "../../core/security/hash.js";
import { generateToken } from "../../core/security/jwt.js";
import jwt from "jsonwebtoken";
import {
    UnauthorizedError,
    ConflictError,
    ValidationError
} from "../../core/errors/AppError.js";
import { LoginInput, CreateDriverInput } from "./auth.validators.js";
import { ERROR_MESSAGES } from "../../../shared/constants.js";
import { UserRole } from "../../../shared/types.js";

/**
 * SERVICE - AUTH
 * 
 * REGRA: Service contém TODA a lógica de negócio
 * Não acessa req/res diretamente
 * Não faz queries diretas (usa repository)
 */

/**
 * Realiza login de um usuário
 */
import crypto from "crypto"; // Native Node module for random tokens

/**
 * Realiza login de um usuário
 */
export async function login(credentials: LoginInput, userAgent?: string, ipAddress?: string) {
    const { email, senha } = credentials;

    // Busca driver no banco
    const driver = await authRepository.findDriverByEmail(email);

    if (!driver) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Verifica se está ativo
    if (!driver.isActive) {
        throw new UnauthorizedError("Usuário inativo. Contate o administrador.");
    }

    // Verifica senha
    let isPasswordValid = await verifyPassword(senha, driver.senha);
    let usedTempPassword = false;

    console.log('[LOGIN DEBUG] Email:', email);
    console.log('[LOGIN DEBUG] Regular password valid:', isPasswordValid);
    console.log('[LOGIN DEBUG] Has temp_password_hash:', !!driver.temp_password_hash);
    console.log('[LOGIN DEBUG] Has temp_password_expires_at:', !!driver.temp_password_expires_at);

    // Se senha principal falhou, tenta a temporária (se existir e não expirou)
    if (!isPasswordValid && driver.temp_password_hash && driver.temp_password_expires_at) {
        const now = new Date();
        const expires = new Date(driver.temp_password_expires_at);

        console.log('[LOGIN DEBUG] Now:', now.toISOString());
        console.log('[LOGIN DEBUG] Expires:', expires.toISOString());
        console.log('[LOGIN DEBUG] Is not expired:', now < expires);

        if (now < expires) {
            const tempPasswordValid = await verifyPassword(senha, driver.temp_password_hash);
            console.log('[LOGIN DEBUG] Temp password valid:', tempPasswordValid);
            if (tempPasswordValid) {
                isPasswordValid = true;
                usedTempPassword = true;
            }
        }
    }

    if (!isPasswordValid) {
        console.log('[LOGIN DEBUG] FAILED - Invalid credentials');
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    // Se usou senha temporária OU flag must_reset_password está ativa
    if (usedTempPassword || driver.must_reset_password) {
        // Gerar JWT curto (10 min) com propósito específico
        const passwordChangeToken = jwt.sign(
            {
                purpose: "PASSWORD_RESET",
                userId: driver.id,
                email: driver.email
            },
            process.env.JWT_SECRET!,
            { expiresIn: "10m" }
        );

        return {
            ok: false,
            next_action: "RESET_PASSWORD_REQUIRED",
            password_change_token: passwordChangeToken
        };
    }

    // Gera token JWT de acesso (Curta duração: 2h -> 30m)
    const accessToken = generateToken({
        userId: driver.id,
        email: driver.email,
        role: driver.role as UserRole,
    });

    // Gera Refresh Token (Opaco e Longa Duração: 14 dias)
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // +14 dias

    // Salva Sessão no Banco
    await authRepository.createSession({
        driverId: driver.id,
        token: refreshToken,
        expiresAt: expiresAt.toISOString(),
        userAgent: userAgent,
        ipAddress: ipAddress
    });

    return {
        requirePasswordReset: false,
        user: {
            id: driver.id,
            nome: driver.nome,
            email: driver.email,
            role: driver.role as UserRole,
        },
        token: accessToken,
        refreshToken: refreshToken // Controller vai colocar no Cookie
    };
}

/**
 * Renova tokens (Refresh Rotation)
 */
export async function refreshToken(oldRefreshToken: string, userAgent?: string, ipAddress?: string) {
    // 1. Busca sessão pelo token
    const session = await authRepository.findSessionByToken(oldRefreshToken);

    if (!session) {
        // Se token não existe, pode ser roubo ou logout já feito.
        // Por segurança, retorna erro genérico.
        throw new UnauthorizedError("Sessão inválida ou expirada");
    }

    // 2. Verifica expiração
    if (new Date(session.expiresAt) < new Date()) {
        await authRepository.deleteSession(session.id); // Limpa lixo
        throw new UnauthorizedError("Sessão expirada");
    }

    // 3. Busca usuário
    const driver = await authRepository.findDriverById(session.driverId);
    if (!driver || !driver.isActive) {
        throw new UnauthorizedError("Usuário inválido");
    }

    // 4. ROTAÇÃO: Deleta sessão antiga
    await authRepository.deleteSession(session.id);

    // 5. Gera novos tokens
    const newAccessToken = generateToken({
        userId: driver.id,
        email: driver.email,
        role: driver.role as UserRole,
    });

    const newRefreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    // 6. Cria nova sessão
    await authRepository.createSession({
        driverId: driver.id,
        token: newRefreshToken,
        expiresAt: expiresAt.toISOString(),
        userAgent: userAgent,
        ipAddress: ipAddress
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
    };
}

/**
 * Faz logout (Remove sessão)
 */
export async function logout(refreshToken?: string) {
    if (refreshToken) {
        const session = await authRepository.findSessionByToken(refreshToken);
        if (session) {
            await authRepository.deleteSession(session.id);
        }
    }
}

/**
 * Cria novo driver/usuário
 */
export async function createNewDriver(data: CreateDriverInput) {
    // Verifica se email já existe
    const existingDriver = await authRepository.findDriverByEmail(data.email);

    if (existingDriver) {
        throw new ConflictError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // Hash da senha
    const hashedPassword = await hashPassword(data.senha);

    // Cria driver
    const newDriver = await authRepository.createDriver({
        ...data,
        senha: hashedPassword,
    });

    // Retorna dados (SEM a senha)
    return {
        id: newDriver.id,
        nome: newDriver.nome,
        email: newDriver.email,
        role: newDriver.role as UserRole,
    };
}

/**
 * Busca dados de um driver por ID
 */
export async function getDriverById(id: string) {
    const driver = await authRepository.findDriverById(id);

    if (!driver) {
        throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // Retorna dados (SEM a senha)
    return {
        id: driver.id,
        nome: driver.nome,
        email: driver.email,
        role: driver.role as UserRole,
        isActive: driver.isActive,
    };
}


/**
 * Busca todos os motoristas (apenas dados seguros)
 */
export async function getAllDrivers() {
    const drivers = await authRepository.findAllDrivers();

    return drivers.map(d => ({
        id: d.id,
        nome: d.nome,
        email: d.email,
        role: d.role as UserRole,
        isActive: d.isActive,
        telefone: d.telefone
    }));
}

/**
 * Realiza a troca obrigatória de senha (via JWT token)
 */
export async function changePasswordRequired(input: { password_change_token: string; new_password: string }) {
    const { password_change_token, new_password } = input;

    // 1. Validar JWT
    let payload: any;
    try {
        payload = jwt.verify(password_change_token, process.env.JWT_SECRET!);
    } catch (error) {
        throw new UnauthorizedError("Token inválido ou expirado. Faça login novamente.");
    }

    // 2. Verificar propósito do token
    if (payload.purpose !== "PASSWORD_RESET") {
        throw new UnauthorizedError("Token inválido para esta operação.");
    }

    // 3. Buscar usuário
    const driver = await authRepository.findDriverById(payload.userId);
    if (!driver) {
        throw new UnauthorizedError(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    // 4. Verificar se ainda precisa trocar senha
    if (!driver.must_reset_password && !driver.temp_password_hash) {
        throw new ValidationError("Senha já foi trocada. Faça login normalmente.");
    }

    // 5. Hash da nova senha
    const newPasswordHash = await hashPassword(new_password);

    // 6. Atualiza senha e limpa flags
    await authRepository.updateDriver(driver.id, {
        senha: newPasswordHash,
        must_reset_password: false,
        temp_password_hash: null,
        temp_password_expires_at: null,
        password_changed_at: new Date()
    } as any);

    // 7. Gera tokens para login automático
    const accessToken = generateToken({
        userId: driver.id,
        email: driver.email,
        role: driver.role as UserRole,
    });

    const refreshToken = crypto.randomBytes(40).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await authRepository.createSession({
        driverId: driver.id,
        token: refreshToken,
        expiresAt: expiresAt.toISOString(),
    });

    return {
        ok: true,
        accessToken,
        refreshToken,
        user: {
            id: driver.id,
            nome: driver.nome,
            email: driver.email,
            role: driver.role as UserRole,
        }
    };
}
