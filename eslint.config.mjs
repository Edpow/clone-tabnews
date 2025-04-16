import { defineConfig, globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";

export default defineConfig([
  {
    plugins: { react },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    rules: {
      "prefer-const": "warn",
      "no-constant-binary-expression": "error",
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    },
  },
  globalIgnores(["node_modules/*", ".next"]),
]);
