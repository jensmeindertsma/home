import eslint from "@eslint/js";
// @ts-expect-error: this package has no type declarations
import importPlugin from "eslint-plugin-import";
import nodePlugin from "eslint-plugin-n";
import simpleImportSortPlugin from "eslint-plugin-simple-import-sort";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
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
      n: nodePlugin,
      "simple-import-sort": simpleImportSortPlugin,
      unicorn: eslintPluginUnicorn,
    },
    rules: {
      "import/first": "warn",
      "import/newline-after-import": "warn",
      "import/no-duplicates": "warn",

      "n/prefer-node-protocol": "warn",
      "n/prefer-promises/fs": "warn",

      "simple-import-sort/imports": [
        "warn",
        {
          groups: [],
        },
      ],
      "simple-import-sort/exports": "warn",

      "unicorn/prefer-node-protocol": "warn",

      "@typescript-eslint/no-unused-vars": ["warn"],
    },
  },
);
