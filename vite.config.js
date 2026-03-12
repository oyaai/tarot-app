import react from "@vitejs/plugin-react";
import obfuscator from "rollup-plugin-obfuscator";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false,
    rollupOptions: {
      plugins: [
        obfuscator({
          globalOptions: {
            compact: true,
            controlFlowFlattening: true,
            numbersToExpressions: true,
            simplify: true,
            stringArray: true,
            stringArrayThreshold: 1,
          },
        }),
      ],
    },
  },
});
