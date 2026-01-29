import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import * as schema from "./schema";

// Create or connect to database
const sqlite = new Database("clinic.db");
export const db = drizzle(sqlite, { schema });

// Run migrations on startup
try {
  migrate(db, { migrationsFolder: "./src/db/migrations" });
  console.log("Database migrations completed");
} catch (error) {
  console.log("Migrations already applied or error:", error);
}
