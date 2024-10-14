import globals from "globals";
import pluginJs from "@eslint/js";
import pluginVue from "eslint-plugin-vue";


export default [
    {
        files: [
            "**/*.{js,mjs,cjs,vue}"
        ],
    },
    {
        ignores: [
            ".cache/*",
            "dist/*",
            "cms/*",
            "src/assets/*",
            "src/.temp/*",
        ]
    },
    {
        languageOptions: {
            globals: globals.node
        },
        plugins: {
            vue: pluginVue,  // Register the Vue plugin
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
                ]
            }],
        },
    },
];
