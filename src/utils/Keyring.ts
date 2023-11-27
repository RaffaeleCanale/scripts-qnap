import { executeCommand } from '~/utils/CmdUtils';

const NAMESPACE = 'qnap';

export const Keyring = {
    async lookupKey(key: string): Promise<string | null> {
        try {
            return (
                await executeCommand(`secret-tool lookup ${NAMESPACE} ${key}`)
            )
                .replaceAll('\n', '')
                .trim();
        } catch {
            return null;
        }
    },

    async storeKey(key: string, value: string): Promise<void> {
        await executeCommand(
            `echo "${value}" | secret-tool store --label ${NAMESPACE}-${key} ${NAMESPACE} ${key}`,
        );
    },

    async clearKey(key: string): Promise<void> {
        try {
            await executeCommand(`secret-tool clear ${NAMESPACE} ${key}`);
        } catch {}
    },
};
