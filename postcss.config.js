import tailwindcss from 'tailwindcss';
import tailwindcssNesting from 'tailwindcss/nesting/index.js';
import postPresetEnv from 'postcss-preset-env';

export default {
    plugins: [postPresetEnv, tailwindcssNesting, tailwindcss]
};
