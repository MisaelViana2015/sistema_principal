
import "dotenv/config";
import { db } from "./server/core/db/connection.js";
import { drivers } from "./shared/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "./server/core/security/hash.js";

async function reset() {
    try {
        console.log("Resetting password for programacao1215@hotmail.com...");
        const newHash = await hashPassword("123456");

        await db.update(drivers)
            .set({ senha: newHash })
            .where(eq(drivers.email, "programacao1215@hotmail.com"));

        console.log("✅ Password reset to '123456'");
        process.exit(0);
    } catch (e) {
        console.error("Error resetting password:", e);
        process.exit(1);
    }
}

reset();
