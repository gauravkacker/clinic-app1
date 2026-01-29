import { migrate } from "drizzle-orm/neon-http/migrator";
import { db } from "./index";

await migrate(db, { migrationsFolder: "./src/db/migrations" });
