
import { db } from "./core/db/connection.js";
import { drivers } from "../shared/schema.js";
import { eq } from "drizzle-orm";

async function checkUser() {
    try {
        const user = await db.select().from(drivers).where(eq(drivers.email, "programacao1215@hotmail.com"));
        console.log("User found:", user);
    } catch (error) {
        console.error("Error checking user:", error);
    } finally {
        process.exit(0);
    }
}

checkUser();
