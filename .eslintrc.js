module.exports = {
    env: {
      es6: true,
      node: true,
      jest: true,
      browser: true,
      mocha: true,
    },
    extends: [
      'airbnb-typescript',
      'prettier','prettier/react'
    ],
    parser: '@typescript-eslint/parser',
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.ts', '.json', '.d.ts','.js','.tsx'],
        },
      },
    },
    plugins:[
      'import',
      'prettier',
      'jest',
      'react',
      'react-hooks'
    ],
    globals: {
      __DEV__: true,
      CLIENT_HOST: true,
    },
    parserOptions: {
      ecmaVersion: 2018,
      sourceType: 'module',
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      'no-underscore-dangle':0,
      'import/prefer-default-export': 'off',
      'react/static-property-placement':[2, 'static public field'],
      '@typescript-eslint/no-explicit-any':'off',
      '@typescript-eslint/member-delimiter-style':'off',
      'no-unused-vars':'error',
      'no-console': 'off',
      '@typescript-eslint/camelcase': 'off',
      'prettier/prettier': 'error',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/semi': 'off',
    },
  };
