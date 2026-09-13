import {
    loadAllFromKeyring,
    usePropertiesManager,
    useSecretsManager,
} from '@RaffaeleCanale/wx-secrets-manager';

import { QnapConfigSchema } from './QnapConfig.ts';

const APP_NAME = 'scripts-qnap';

export async function loadConfig(withPassword: boolean) {
    await loadAllFromKeyring('scripts-qnap', false);

    if (withPassword && useProperties().getProperty('qnapPassword') === undefined) {
        await useSecrets().loadSecrets();
    }
}

export function useProperties() {
    return usePropertiesManager({ appName: APP_NAME }, { parser: QnapConfigSchema.parse });
}

export function useSecrets() {
    return useSecretsManager<'QNAP_PASSWORD'>({ appName: APP_NAME });
}
