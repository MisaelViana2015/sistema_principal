
import "dotenv/config";
// Tenta carregar do server/.env se nao carregar automatico (dependendo de onde rodo)
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "server", ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
    console.log("DATABASE_URL não está definida.");
} else {
    try {
        // Tenta mascarar senha
        const urlObj = new URL(url);
        console.log(`Host utilizado: ${urlObj.host}`);
        console.log(`Database path: ${urlObj.pathname}`);
    } catch (e) {
        console.log("DATABASE_URL existe mas não é uma URL válida para parsear host.");
        console.log("Valor (início): " + url.substring(0, 15) + "...");
    }
}
