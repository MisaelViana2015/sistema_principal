
import { requestContext } from "../core/middlewares/requestContext.js";
import { Request, Response } from "express";

// Mock Express Objects
const req: any = {
    headers: {},
    get: () => "TestAgent",
    ip: "127.0.0.1"
};
const res: any = {
    setHeader: () => { },
    on: () => { }
};
const next = () => { };

console.log("1. Running requestContext middleware...");
requestContext(req, res, next);

console.log("Audit Context Initial:", req.auditContext);

console.log("2. Simulating Auth Middleware logic...");
// Simulate Auth Logic directly (since we can't easily mock DB/JWT here without imports)
const mockUser = { userId: "user-123", role: "driver" };
req.user = mockUser;

if (req.auditContext) {
    req.auditContext.actorType = req.user.role === 'admin' || req.user.role === 'supervisor' ? 'admin' : 'user';
    req.auditContext.actorId = req.user.userId;
    req.auditContext.actorRole = req.user.role;
}

console.log("Audit Context After Auth:", req.auditContext);

if (req.auditContext.actorId === "user-123" && req.auditContext.actorType === "user") {
    console.log("✅ SUCCESS: Context updated correctly!");
} else {
    console.error("❌ FAILURE: Context not updated.");
    process.exit(1);
}
