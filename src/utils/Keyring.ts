import { Shell } from '~/utils/CmdUtils';

const NAMESPACE = 'qnap';

export const Keyring = {
    async lookupKey(key: string): Promise<string | null> {
        try {
            return (await Shell.secretTool.lookup(NAMESPACE, key))
                .replaceAll('\n', '')
                .trim();
        } catch {
            return null;
        }
    },

    async storeKey(key: string, value: string): Promise<void> {
        await Shell.secretTool.store(NAMESPACE, key, value);
    },

    async clearKey(key: string): Promise<void> {
        try {
            await Shell.secretTool.clear(NAMESPACE, key);
        } catch {
            /* empty */
        }
    },
};
