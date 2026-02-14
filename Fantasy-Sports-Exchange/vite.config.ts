import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Only import Replit plugins if in Replit environment
const isReplit = process.env.REPL_ID !== undefined;

// Load Replit plugins conditionally
async function getReplitPlugins() {
  if (process.env.NODE_ENV !== "production" && isReplit) {
    try {
      const [runtimeErrorOverlay, cartographer, devBanner] = await Promise.all([
        import("@replit/vite-plugin-runtime-error-modal").then((m) => m.default()),
        import("@replit/vite-plugin-cartographer").then((m) => m.cartographer()),
        import("@replit/vite-plugin-dev-banner").then((m) => m.devBanner()),
      ]);
      return [runtimeErrorOverlay, cartographer, devBanner];
    } catch (e) {
      console.warn("Failed to load Replit plugins:", e);
      return [];
    }
  }
  return [];
}

export default defineConfig(async () => {
  const replitPlugins = await getReplitPlugins();
  
  return {
    plugins: [
      react(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
