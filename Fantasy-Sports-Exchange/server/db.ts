import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  const errorMessage = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ DATABASE_URL is not set!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your application needs a PostgreSQL database to run.

🔧 HOW TO FIX:

If you're running LOCALLY:
  1. Create a .env file in the project root
  2. Add: DATABASE_URL=postgresql://localhost:5432/fantasyarena
  3. Make sure PostgreSQL is installed and running
  4. Create the database: createdb fantasyarena
  
  📖 See: ENVIRONMENT_VARIABLES.md for detailed local setup

If you deployed to RENDER:
  1. Check that PostgreSQL database is provisioned
  2. Verify database shows "Available" status in Render dashboard
  3. Check web service has DATABASE_URL set in Environment tab
  4. If using Blueprint, database should auto-connect (wait 2-3 min)
  5. DATABASE_URL should include SSL parameter (auto-added by this app)
  
  📖 See: RENDER_DEPLOYMENT.md for troubleshooting

If you deployed to RAILWAY:
  1. Add PostgreSQL service from Railway dashboard
  2. Railway will automatically set DATABASE_URL
  3. Restart your web service after database is added
  
  📖 See: RAILWAY_DEPLOYMENT.md for instructions

📚 More help: ENVIRONMENT_VARIABLES.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  
  console.error(errorMessage);
  throw new Error("DATABASE_URL must be set. See error message above for solutions.");
}

// Ensure SSL is enabled for Render PostgreSQL connections
// Render requires SSL for external connections
let databaseUrl = process.env.DATABASE_URL;

// Check if we're on Render or if URL doesn't have SSL parameters already
const isRender = process.env.RENDER === 'true' || databaseUrl.includes('render.com');
const hasSSL = databaseUrl.includes('ssl=') || databaseUrl.includes('sslmode=');

if (isRender && !hasSSL) {
  // Add SSL mode for Render PostgreSQL
  const separator = databaseUrl.includes('?') ? '&' : '?';
  databaseUrl = `${databaseUrl}${separator}sslmode=require`;
  console.log("✓ SSL mode added to DATABASE_URL for Render PostgreSQL");
}

export const pool = new Pool({ 
  connectionString: databaseUrl,
  ssl: isRender ? { rejectUnauthorized: false } : undefined
});
export const db = drizzle(pool, { schema });
