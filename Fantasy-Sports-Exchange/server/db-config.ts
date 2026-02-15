/**
 * Utility functions for database configuration
 * Shared between runtime connection (db.ts) and migrations (drizzle.config.ts)
 */

/**
 * Prepare DATABASE_URL for Render PostgreSQL by adding SSL if needed
 * Render requires SSL for external connections but uses self-signed certificates
 * 
 * @param databaseUrl - The DATABASE_URL from environment
 * @returns Modified URL with SSL parameters if on Render
 */
export function prepareDatabaseUrl(databaseUrl: string | undefined): string {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable must be set");
  }

  // Check if we're on Render using secure detection
  const isRender = isRenderPlatform();
  const hasSSL = databaseUrl.includes('ssl=') || databaseUrl.includes('sslmode=');

  if (isRender && !hasSSL) {
    // Add SSL mode for Render PostgreSQL
    const separator = databaseUrl.includes('?') ? '&' : '?';
    databaseUrl = `${databaseUrl}${separator}sslmode=require`;
    console.log("✓ SSL mode added to DATABASE_URL for Render PostgreSQL");
  }

  return databaseUrl;
}

/**
 * Check if we're running on Render platform
 * Uses environment variable for primary detection (more reliable)
 * 
 * @returns true if on Render, false otherwise
 */
export function isRenderPlatform(): boolean {
  // Primary detection: Render sets this environment variable
  if (process.env.RENDER === 'true') {
    return true;
  }
  
  // Secondary detection: Check if DATABASE_URL is from Render's PostgreSQL
  // Only check the hostname part of the URL to avoid substring issues
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    try {
      const url = new URL(databaseUrl);
      // Render PostgreSQL hostnames end with .render.com
      return url.hostname.endsWith('.render.com');
    } catch {
      // Invalid URL format, fall back to false
      return false;
    }
  }
  
  return false;
}

/**
 * Get SSL configuration for PostgreSQL Pool connection
 * 
 * @returns SSL config object or undefined for local connections
 */
export function getSSLConfig() {
  const isRender = isRenderPlatform();
  
  if (!isRender) {
    return undefined;
  }

  // Note: rejectUnauthorized: false is required for Render PostgreSQL
  // Render's PostgreSQL uses self-signed certificates that aren't in the Node.js CA bundle
  // This is safe because:
  // 1. Connection still uses TLS encryption (sslmode=require)
  // 2. Render's infrastructure is trusted
  // 3. Alternative would require custom CA certificate configuration
  // See: https://render.com/docs/databases#connecting-with-ssl
  return { rejectUnauthorized: false };
}
