// build.ts
import { defineConfig } from 'vite';
import { build } from 'esbuild';

const config = defineConfig({
  // Vite config
  root: 'client',
  build: {
    outDir: '../dist/client',
    rollupOptions: {
      input: 'client/main.ts',
    },
  },
});

const buildServer = async () => {
  await build({
    entryPoints: ['server/main.ts'],
    bundle: true,
    outfile: '../dist/server.js',
  });
};

export default config;

buildServer();