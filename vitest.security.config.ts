import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/test/security.test.ts"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/test/**",
        "**/tests/**",
        "**/__tests__/**",
        "**/coverage/**",
      ],
    },
  },
});
