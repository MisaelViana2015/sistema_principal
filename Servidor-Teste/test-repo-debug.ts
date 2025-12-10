
import "dotenv/config";
console.log("Starting debug...");

// Uncomment one by one
import { db } from "./server/core/db/connection.js";
console.log("DB Imported");

import { drivers } from "./shared/schema.js";
console.log("Schema Imported");

import { eq } from "drizzle-orm";
console.log("Drizzle Imported");

import * as validators from "./server/modules/auth/auth.validators.js";
console.log("Validators Imported");

console.log("ALL OK");
