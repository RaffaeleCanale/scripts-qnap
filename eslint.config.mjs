import config from '@canale/eslint-config-wx';
import tseslint from 'typescript-eslint';

export default config(import.meta.dirname, tseslint, {
    'no-console': 'off',
});
