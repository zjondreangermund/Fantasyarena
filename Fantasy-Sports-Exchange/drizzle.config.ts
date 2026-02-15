import { defineConfig } from "drizzle-kit";

// Ensure SSL is enabled for Render PostgreSQL connections
// Render requires SSL for external connections
let databaseUrl = process.env.DATABASE_URL!;

// Check if we're on Render or if URL doesn't have SSL parameters already
const isRender = process.env.RENDER === 'true' || (databaseUrl && databaseUrl.includes('render.com'));
const hasSSL = databaseUrl && (databaseUrl.includes('ssl=') || databaseUrl.includes('sslmode='));

if (isRender && !hasSSL) {
  // Add SSL mode for Render PostgreSQL
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}sslmode=require`;
}

export default defineConfig({
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
});
