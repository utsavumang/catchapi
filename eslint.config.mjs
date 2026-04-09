import js from "@eslint/js";

export default [
  {
    ignores: ["node_modules/", "dist/", ".turbo/"]
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        module: "readonly",
        require: "readonly",
        process: "readonly"
      }
    }
  }
];