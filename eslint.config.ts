import eslint from "@eslint/js";
// @ts-expect-error: this package has no type declarations
import importPlugin from "eslint-plugin-import";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["build", ".react-router", "app/generated"],
  },
  {
    plugins: {
      import: importPlugin,
      "simple-import-sort": simpleImportSortPlugin,
    },
    rules: {
      "simple-import-sort/imports": [
        "warn",
        {
          groups: [],
        },
      ],
      "simple-import-sort/exports": "warn",
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "warn",

      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
);
