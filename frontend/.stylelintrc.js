module.exports = {
  extends: ["@novicell/stylelint-config","stylelint-prettier/recommended", "stylelint-config-prettier"],
  rules: {
    // Extensions here
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'tailwind',
        'screen',
        // 'apply',
        // 'variants',
        // 'responsive',
      ]
    }],
    'function-no-unknown': [true, {
      ignoreFunctions: [
        "theme",
        "v-bind",
      ]
    }],
    'value-keyword-case': ['lower', {
      ignoreFunctions: [
        'v-bind' // js vars in v-bind in css should not be lowercase
      ]
    }],
    '@novicell/declaration-block-single-line': null,
    "declaration-property-unit-allowed-list": null
  }
}