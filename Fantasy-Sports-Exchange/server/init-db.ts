import { exec } from "child_process";
import { promisify } from "util";
import { db } from "./db";
import { sql } from "drizzle-orm";

const execAsync = promisify(exec);

/**
 * Initialize database schema using Drizzle Kit push
 * This runs on server startup in production to ensure tables exist
 */
export async function initializeDatabase() {
  try {
    console.log("================================================================================");
    console.log("Database Initialization");
    console.log("================================================================================");
    
    // Check if tables already exist by trying to query users table
    try {
      await db.execute(sql`SELECT 1 FROM users LIMIT 1`);
      console.log("✓ Database schema already exists - skipping initialization");
      console.log("================================================================================");
      return;
    } catch (error: any) {
      // Error code 42P01 means "relation does not exist" - expected on first run
      // DEPTH_ZERO_SELF_SIGNED_CERT can happen during initial connection before SSL config applies
      if (error.code !== '42P01' && error.code !== 'DEPTH_ZERO_SELF_SIGNED_CERT') {
        console.error("⚠ Unexpected error checking database schema:", error.message);
        throw error;
      }
      
      if (error.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
        console.log("⚠ Self-signed certificate detected - this is expected for Render PostgreSQL");
        console.log("   SSL configuration will handle this for database operations");
      }
      
      console.log("Database schema does not exist - initializing...");
    }
    
    // Run drizzle-kit push to create schema
    console.log("Running drizzle-kit push to create database schema...");
    const { stdout, stderr } = await execAsync(
      "npx drizzle-kit push --config Fantasy-Sports-Exchange/drizzle.config.ts",
      { 
        env: { ...process.env },
        cwd: process.cwd() 
      }
    );
    
    if (stdout) {
      console.log("Drizzle Kit output:");
      console.log(stdout);
    }
    
    if (stderr && !stderr.includes('warning')) {
      console.error("Drizzle Kit errors:");
      console.error(stderr);
    }
    
    // Verify schema was created
    try {
      await db.execute(sql`SELECT 1 FROM users LIMIT 1`);
      console.log("✓ Database schema successfully created!");
    } catch (error) {
      console.error("✗ Database schema creation may have failed");
      throw error;
    }
    
    console.log("================================================================================");
  } catch (error: any) {
    console.error("================================================================================");
    console.error("❌ Database initialization failed!");
    console.error("================================================================================");
    console.error("Error:", error.message);
    console.error("");
    console.error("This usually means:");
    console.error("1. DATABASE_URL is not correctly set");
    console.error("2. Database is not accessible");
    console.error("3. drizzle-kit is not installed");
    console.error("");
    console.error("Try manually running:");
    console.error("  npm run db:push");
    console.error("");
    console.error("Or check the DATABASE_URL connection in Render dashboard.");
    console.error("================================================================================");
    throw error;
  }
}
