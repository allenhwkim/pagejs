import { defineConfig } from "vite";
import path from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'lib/index.ts'),
      name: '@pgjs/core',
      fileName: 'index',
    },
  },
  plugins: [dts()],
});