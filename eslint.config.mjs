import js from "@eslint/js";
import globals from "globals";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 2021,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["tests/**/*.test.js"],
    languageOptions: {
      globals: { ...globals.jest },
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      sourceType: "commonjs",
    },
  },
];
