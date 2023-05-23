import { defineConfig } from "vite";
import postcssNesting from 'postcss-nesting';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { minimatch } from 'minimatch'
import path from 'path';
import { exec } from 'child_process';

const watchNRun = (options) => ({
  handleHotUpdate({file, server}) {
    const shouldRun = Array.of(options.pattern).flat()
      .find(el => minimatch(file, path.resolve(server.config.root, el)));
    shouldRun && exec(options.command, (exception, output, error) => {
      if (output) console.log(output);
      if (error) console.error(error);
    })
  }
});

export default defineConfig({
  plugins: [
    watchNRun({pattern: "pages/**/*.html", command: "node ./page-route/build-pages-data.js --silent"}),
    nodePolyfills({protocolImports: true}), // Whether to polyfill `node:` protocol imports.
  ],
  css: {
    postcss: {
      plugins: [
        postcssNesting
      ],
    },
  },
});