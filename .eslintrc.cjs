module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module",
    ecmaVersion: "ES2022",
    extraFileExtensions: ['.json'], // 添加这一行
  },
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "unicorn",
    "eslint-comments",
    "sonarjs",
  ],
  settings: {},
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:unicorn/recommended",
    "plugin:eslint-comments/recommended",
    "plugin:sonarjs/recommended",
    "prettier",
  ],
  tsconfigRootDir: __dirname,
  root: true,
  env: {
    es6: true,
    node: true,
  },
  ignorePatterns: [".eslintrc.cjs", "dist"],
  rules: {
    "import/namespace": "off", // this is very slow
    "eslint-comments/disable-enable-pair": [
      "error",
      { allowWholeFile: true },
    ],
   "unicorn/prefer-node-protocol": "off",
    "unicorn/filename-case": "off",
    // "unicorn/filename-case": [
    //   "error",
    //   {
    //     ignore: [/^\.\+spec\.ts$/],
    //     cases: {
    //       camelCase: true,
    //       pascalCase: true,
    //     },
    //   },
    // ],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "default",
        format: ["camelCase"],
      },
      {
        selector: "variable",
        format: ["PascalCase", "UPPER_CASE"],
        types: ["boolean"],
        prefix: ["is", "should", "has", "can", "did", "will"],
      },
      {
        selector: "variableLike",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
      },

      {
        selector: "parameter",
        format: ["camelCase"],
      },
      {
        selector: "memberLike",
        modifiers: ["private"],
        format: ["camelCase"],
        leadingUnderscore: "forbid",
      },
      {
        selector: "typeLike",
        format: ["PascalCase"],
        filter: {
          //prettier-ignore
          regex: "\\d{10}$",
          match: false,
        },
      },
      {
        selector: "property",
        modifiers: ["readonly"],
        format: ["camelCase"],
      },
      {
        selector: "enumMember",
        format: ["UPPER_CASE"],
      },
    ],
    "unicorn/prevent-abbreviations": [
      "error",
      {
        checkFilenames: false,
        replacements: {
          e: {},
          e2e: {
            checkFilenames: false,
          },
          res: false,
          cmd: {
            command: true,
          },
          errCb: {
            handleError: true,
          },
        },
      },
    ],
  },
};
