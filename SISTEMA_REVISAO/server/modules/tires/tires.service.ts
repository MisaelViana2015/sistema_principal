
import * as tiresRepository from "./tires.repository.js";
import { InsertTire } from "../../../shared/schema.js";
import { auditService, AuditContext } from "../../core/audit/audit.service.js";

export async function create(data: InsertTire, context?: AuditContext) {
    if (context) {
        return await auditService.withAudit({
            action: 'CREATE_TIRE',
            entity: 'tires',
            entityId: 'new',
            operation: 'INSERT',
            context,
            execute: () => tiresRepository.createTire(data),
            fetchAfter: (result) => tiresRepository.findTireById(result!.id)
        });
    }
    return await tiresRepository.createTire(data);
}

export async function getAll() {
    return await tiresRepository.findAllTires();
}

export async function remove(id: string, context?: AuditContext) {
    if (context) {
        return await auditService.withAudit({
            action: 'DELETE_TIRE',
            entity: 'tires',
            entityId: id,
            operation: 'DELETE',
            context,
            fetchBefore: () => tiresRepository.findTireById(id),
            execute: () => tiresRepository.deleteTire(id)
        });
    }
    return await tiresRepository.deleteTire(id);
}
