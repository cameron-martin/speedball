module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "extends": "eslint:recommended",
    "parser": "babel-eslint",
    "parserOptions": {
        "sourceType": "module"
    },
    "plugins": [
      "flow-vars"
    ],
    "rules": {
        "indent": ["error", 2, { VariableDeclarator: {var: 2, let: 2, const: 3} }],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "single", { allowTemplateLiterals: true, avoidEscape: true }],
        "semi": ["error", "always"],
        "no-unused-vars": ["error", { vars: "all", args: "none" }],
        "flow-vars/define-flow-type": 1,
        "flow-vars/use-flow-type": 1
    },
};
