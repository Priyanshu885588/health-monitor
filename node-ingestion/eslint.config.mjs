import pluginJs from "@eslint/js";
import globals from "globals"; // Import the globals package

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node, // This tells ESLint that 'require', 'process', etc. are valid
        ...globals.jest, // This tells ESLint that 'test' and 'expect' are valid
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
];
