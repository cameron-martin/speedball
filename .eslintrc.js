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
        "indent": [2, 2, { VariableDeclarator: {var: 2, let: 2, const: 3} }],
        "linebreak-style": [2, "unix"],
        "quotes": [2, "single", { allowTemplateLiterals: true, avoidEscape: true }],
        "semi": [2, "always"],
        "no-unused-vars": [2, { vars: "all", args: "none" }],

        "flow-vars/define-flow-type": 1,
        "flow-vars/use-flow-type": 1
    },
};
