
import "dotenv/config";

console.log("Checking ENV vars...");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "DEFINED" : "UNDEFINED");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "DEFINED" : "UNDEFINED");
console.log("PORT:", process.env.PORT);

if (!process.env.DATABASE_URL) {
    console.error("FAIL: DATABASE_URL missing");
    process.exit(1);
}

if (!process.env.JWT_SECRET) {
    console.error("FAIL: JWT_SECRET missing");
    process.exit(1);
}

console.log("SUCCESS: Env vars loaded.");
