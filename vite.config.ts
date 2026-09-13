import { wxStarter } from '@RaffaeleCanale/starter';
import { defineConfig } from 'vite-plus';

export default defineConfig({
    plugins: [wxStarter({ lint: { applicationType: 'node' } })],
    lint: {
        rules: {
            'no-console': 'off',
        },
    },
});
