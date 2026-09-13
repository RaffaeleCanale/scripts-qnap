import { Secret } from '@RaffaeleCanale/wx-secrets-manager';

import type { QnapConfig } from '../config/QnapConfig.ts';
import { useSecrets } from '../config/WxSecrets.ts';

export const PasswordManager = {
    getQnapPassword(config: QnapConfig): Secret {
        const secrets = useSecrets();

        return config.qnapPassword
            ? Secret.createFromString(config.qnapPassword)
            : secrets.getSecret('QNAP_PASSWORD');
    },
};
