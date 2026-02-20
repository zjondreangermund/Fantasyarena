import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import type { UserConfig } from "vite";
import { fileURLToPath } from "url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(async ({ command }): Promise<UserConfig> => {
  const plugins = [react()];

  if (command === "serve") {
    const { default: runtimeErrorOverlay } = await import(
      "@replit/vite-plugin-runtime-error-modal"
    );
    plugins.push(runtimeErrorOverlay());

    if (process.env.REPL_ID !== undefined) {
      const { cartographer } = await import(
        "@replit/vite-plugin-cartographer"
      );
      const { devBanner } = await import("@replit/vite-plugin-dev-banner");

      plugins.push(cartographer(), devBanner());
    }
  }

  return {
    base: process.env.BASE_PATH || "/",
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "client", "src"),
        "@shared": path.resolve(rootDir, "shared"),
        "@assets": path.resolve(rootDir, "attached_assets"),
      },
    },
    root: path.resolve(rootDir, "client"),
    build: {
      outDir: path.resolve(rootDir, "dist/public"),
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
