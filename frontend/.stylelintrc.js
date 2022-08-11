module.exports = {
  extends: "@novicell/stylelint-config",
  rules: {
    // Extensions here
    'at-rule-no-unknown': [true, {
      ignoreAtRules: [
        'tailwind',
        'apply',
        'variants',
        'responsive',
        'screen'
      ]
    }],
    'function-no-unknown': [true, {
      ignoreFunctions: [
        "theme"
      ]
    }],
  }
}