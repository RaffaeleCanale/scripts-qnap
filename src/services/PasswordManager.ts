import prompts from 'prompts';
import { QnapConfig } from '~/config/QnapConfig';
import { Keyring } from '~/utils/Keyring';

const PASSWORD_KEY = 'qnapPassword';

function loadPasswordFromKeyring(): Promise<string | null> {
    return Keyring.lookupKey('qnapPassword');
}

function storePassword(password: string): Promise<void> {
    return Keyring.storeKey(PASSWORD_KEY, password);
}

function clearPassword(): Promise<void> {
    return Keyring.clearKey(PASSWORD_KEY);
}

async function promptPassword(): Promise<string> {
    const { password } = (await prompts({
        type: 'password',
        name: 'password',
        message: 'Please enter the QNAP password:',
    })) as { password?: string };

    if (!password) {
        throw new Error('No password provided.');
    }

    return password;
}

export const PasswordManager = {
    async getQnapPassword(config: QnapConfig): Promise<string> {
        let password = config.qnapPassword ?? (await loadPasswordFromKeyring());

        if (!password) {
            password = await promptPassword();
            await storePassword(password);
        }

        return password;
    },

    clearQnapPassword(): Promise<void> {
        return clearPassword()
    }
};
