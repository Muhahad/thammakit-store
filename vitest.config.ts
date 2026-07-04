import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

/** Vitest configured with the `@/` alias so tests can import app modules. */
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, "./src") },
  },
});
