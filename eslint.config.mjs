import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";


export default [
    {
        files: [
            "**/*.{js,mjs,cjs,vue}"
        ],
    },
    {
        ignores: [
            ".cache/*",
            "assets/*",
            ".nuxt/*",
            ".output/*",
            "node_modules/*",
        ]
    },
    {
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
            },
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
        plugins: {
            vue: pluginVue, // Register the Vue plugin
        },
    },
    pluginJs.configs.recommended,
    ...pluginVue.configs["flat/recommended"],
    {
        rules: {
            // Add or modify rules as necessary
            "vue/no-unused-components": "warn",
            "vue/no-deprecated-slot-attribute": "error",
            "no-unused-vars": "warn",
            "semi": ["error", "always"], // Example JS rule to enforce semicolons
            "vue/no-v-html": "off",
            "vue/multi-word-component-names": ["warn",{
                "ignores": [
                    "Index",
                    "Layout",
                    "default",
                ]
            }],
        },
    },
];
