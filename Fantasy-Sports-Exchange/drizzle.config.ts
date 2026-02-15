import { defineConfig } from "drizzle-kit";
import { prepareDatabaseUrl } from "./Fantasy-Sports-Exchange/server/db-config";

// Prepare DATABASE_URL with SSL configuration for Render if needed
const databaseUrl = prepareDatabaseUrl(process.env.DATABASE_URL);

export default defineConfig({
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
