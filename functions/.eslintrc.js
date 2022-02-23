module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "google",
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["tsconfig.json", "tsconfig.dev.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
  ],
  plugins: [
    "@typescript-eslint",
    "import",
  ],
  rules: {
    "quotes": "off",
    "semi": "off",
    "max-len": "off",
	"no-tabs": "off",
	"indent": "off",
	"object-curly-spacing": "off",
	"no-trailing-spaces": "off",
	"padded-blocks": "off",
	"comma-dangle": "off",
    "import/no-unresolved": 0,
	"noImplicitAny": "off",
  },
};
