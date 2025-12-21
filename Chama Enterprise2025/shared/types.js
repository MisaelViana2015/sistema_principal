"use strict";
/**
 * TIPOS COMPARTILHADOS ENTRE CLIENT E SERVER
 *
 * REGRA: Tipos que são usados tanto no frontend quanto no backend
 * devem estar aqui para evitar duplicação.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRole = void 0;
// ============================================
// ENUMS DE SISTEMA
// ============================================
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["DRIVER"] = "driver";
    UserRole["SUPERVISOR"] = "supervisor";
})(UserRole || (exports.UserRole = UserRole = {}));
