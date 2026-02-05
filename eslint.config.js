import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "*.config.js",
      "*.config.ts",
      "vite.config.ts",
      "security-config.ts",
      "src/data/*.json",
      ".vscode/islamic-dictionary.txt",
      "*.md",
      "*.d.ts",
      "jest.config.cjs",
      "security-config.js",
      "scripts/**",
      "test-*.js",
      "*.cjs",
      "test-server.js",
      "*.js",
      "*.html",
      "*.json",
      "*.md",
      "*.ps1",
      "*.toml",
      "*.rules",
      "*.ignore",
      "*.npmrc",
      "public/sw.js",
      "cypress/**",
      "src/vite-env.d.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      // Basic rules for TypeScript/React
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "no-undef": "warn",
      "no-redeclare": "warn",
      "no-case-declarations": "warn",
      "no-control-regex": "warn",
      "no-misleading-character-class": "warn",
      "no-useless-escape": "warn",
    },
  },
];
