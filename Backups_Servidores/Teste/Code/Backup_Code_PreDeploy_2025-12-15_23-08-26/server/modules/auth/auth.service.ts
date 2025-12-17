import * as authRepository from "./auth.repository.js";
import { hashPassword, verifyPassword } from "../../core/security/hash.js";
import { generateToken } from "../../core/security/jwt.js";
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
    const isPasswordValid = await verifyPassword(senha, driver.senha);

    if (!isPasswordValid) {
        throw new UnauthorizedError(ERROR_MESSAGES.INVALID_CREDENTIALS);
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
