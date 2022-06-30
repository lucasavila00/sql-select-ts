// eslint-disable-next-line no-undef
module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "jest"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "plugin:jest/recommended",
    ],
    rules: {
        "no-console": "error",
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/ban-ts-comment": [
            1,
            {
                "ts-expect-error": false,
                "ts-ignore": true,
                "ts-nocheck": true,
            },
        ],
    },
};
