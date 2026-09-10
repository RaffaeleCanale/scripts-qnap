import {
    useEncryptionKey,
    useFirebaseApp,
    usePropertiesManager,
    useSecretsManager,
} from '@RaffaeleCanale/wx-secrets-manager';

const APP_NAME = 'scripts-qnap';

export async function loadConfig(withSecrets: boolean) {
    await using app = useFirebaseAppWrapper();
    await app.loginFromKeyring();
    await useEncryptionKey().loadKeyFromKeyring();
    await useProperties().loadProperties();
    if (withSecrets) {
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
