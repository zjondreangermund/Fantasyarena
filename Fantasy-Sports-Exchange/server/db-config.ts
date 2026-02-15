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

  // Check if we're on Render or if URL doesn't have SSL parameters already
  const isRender = process.env.RENDER === 'true' || databaseUrl.includes('render.com');
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
 * 
 * @returns true if on Render, false otherwise
 */
export function isRenderPlatform(): boolean {
  return process.env.RENDER === 'true' || 
         (process.env.DATABASE_URL?.includes('render.com') ?? false);
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
