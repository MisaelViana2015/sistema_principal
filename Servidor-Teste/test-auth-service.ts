
import "dotenv/config";
console.log("Starting Service Debug...");

try {
    const hash = await import("./server/core/security/hash.js");
    console.log("Hash imported");
} catch (e) {
    console.error("Hash failed:", e);
}

try {
    const jwt = await import("./server/core/security/jwt.js");
    console.log("JWT imported");
} catch (e) {
    console.error("JWT failed:", e);
}

try {
    const repo = await import("./server/modules/auth/auth.repository.js");
    console.log("Repository imported");
} catch (e) {
    console.error("Repository failed:", e);
}

try {
    const service = await import("./server/modules/auth/auth.service.js");
    console.log("Service imported");
} catch (e) {
    console.error("Service failed:", e);
}

console.log("Service Debug Complete");
