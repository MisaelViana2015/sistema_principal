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
export async function login(credentials: LoginInput) {
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

    // Atualiza último login
    // await authRepository.updateLastLogin(driver.id);

    // Gera token JWT
    const token = generateToken({
        userId: driver.id,
        email: driver.email,
        role: driver.role as UserRole,
    });

    // Retorna dados do usuário (SEM a senha)
    return {
        user: {
            id: driver.id,
            nome: driver.nome,
            email: driver.email,
            role: driver.role as UserRole,
        },
        token,
    };
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
