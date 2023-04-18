import { defineConfig } from "vite";
import postcssNesting from 'postcss-nesting';
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    nodePolyfills({
      // Whether to polyfill `node:` protocol imports.
      protocolImports: true,
    }),
  ],
  css: {
      postcss: {
          plugins: [
              postcssNesting
          ],
      },
  },
});