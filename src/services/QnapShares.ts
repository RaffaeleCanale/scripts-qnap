import fs from 'fs';
import path from 'path';
import util from 'util';
import { QnapConfig } from '~/config/QnapConfig';
import { isMounted, mount, MountOptions, unmount } from '~/utils/MountUtils';

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
    const directory = path.join(config.mountDirectory, `QNAP_${share}`);

    return unmount(directory, config.sudo);
}

export function mountShare(
    config: QnapConfig,
    share: string,
    password: string,
): Promise<void> {
    const directory = path.join(config.mountDirectory, `QNAP_${share}`);
    const options: MountOptions = {
        address: `//${config.hostname}/${share}`,
        user: config.qnapUser,
        password,
        sudo: config.sudo,
    };

    return mount(directory, options);
}
