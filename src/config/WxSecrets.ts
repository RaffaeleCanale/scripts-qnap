import {
    useEncryptionKey,
    useFirebaseApp,
    usePropertiesManager,
    useSecretsManager,
} from '@RaffaeleCanale/wx-secrets-manager';
import { useConfig } from './QnapConfigReader.ts';

const APP_NAME = 'scripts-qnap';

export async function loadConfig(withPassword: boolean) {
    await using app = useFirebaseAppWrapper();
    await app.loginFromKeyring();
    await useEncryptionKey().loadKeyFromKeyring();
    await useProperties().loadProperties();

    if (withPassword && useConfig().qnapPassword === undefined) {
        await useSecrets().loadSecrets();
    }
}

export function useProperties() {
    return usePropertiesManager({ appName: APP_NAME });
}

export function useSecrets() {
    return useSecretsManager<'QNAP_PASSWORD'>({ appName: APP_NAME });
}

function useFirebaseAppWrapper() {
    const app = useFirebaseApp();

    return {
        ...app,
        [Symbol.asyncDispose]: () => app.close(),
    };
}
