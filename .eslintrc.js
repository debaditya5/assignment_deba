module.exports = {
  root: true,
  extends: [
    "next/core-web-vitals",
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/recommended",
    "prettier",
  ],
  parserOptions: {
    ecmaVersion: 2023,
    sourceType: "module",
  },
  plugins: ["react", "import"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "import/order": [
      "warn",
      {
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true },
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      },
    ],
  },
  settings: {
    react: { version: "detect" },
  },
};


