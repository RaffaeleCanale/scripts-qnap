import { Secret } from '@RaffaeleCanale/wx-secrets-manager';
import fs from 'fs';
import path from 'path';
import util from 'util';
import type { MountDirectory, QnapConfig } from '../config/QnapConfig.ts';
import {
    isMounted,
    mount,
    unmount,
    type MountOptions,
} from '../utils/MountUtils.ts';

export type ShareDirectory = `${MountDirectory}/QNAP_${string}`;

export async function getMountedShares(config: QnapConfig): Promise<string[]> {
    const children = await util.promisify(fs.readdir)(config.mountDirectory);
    const result: string[] = [];

    for (const child of children) {
        if (child.startsWith('QNAP_')) {
            if (await isMounted(path.join(config.mountDirectory, child))) {
                result.push(child.substring(5));
            }
        }
    }

    return result;
}

export function unmountShare(config: QnapConfig, share: string): Promise<void> {
    const directory = `${config.mountDirectory}/QNAP_${share}` as const;

    return unmount(directory);
}

export function mountShare(
    config: QnapConfig,
    share: string,
    password: Secret,
): Promise<void> {
    const directory = `${config.mountDirectory}/QNAP_${share}` as const;
    const options: MountOptions = {
        address: `//${config.hostname}/${share}`,
        user: config.qnapUser,
        password,
    };

    return mount(directory, options);
}
