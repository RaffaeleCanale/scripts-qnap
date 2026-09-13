import {
    createPropertiesManager,
    createSecretsManager,
    define,
    loadAllFromKeyring,
} from '@RaffaeleCanale/wx-secrets-manager';

import { QnapConfigSchema } from './QnapConfig.ts';

const APP_NAME = 'scripts-qnap';

export async function loadConfig(withPassword: boolean) {
    const properties = useProperties();
    await loadAllFromKeyring(properties);

    if (withPassword && properties.getProperty('qnapPassword') === undefined) {
        await useSecrets().loadSecrets();
    }
}

export const useSecrets = define(() =>
    createSecretsManager<'QNAP_PASSWORD'>({ appName: APP_NAME }),
);

export const useProperties = define(() =>
    createPropertiesManager({
        appName: APP_NAME,
        parser: QnapConfigSchema.parse,
    }),
);
