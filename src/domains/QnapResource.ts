import fs from 'fs';
import path from 'path';
import util from 'util';
import { QnapConfig } from '~/config/QnapConfig';
import { isMounted, mount, MountOptions, unmount } from '~/utils/MountUtils';

export async function getMountedDomains(config: QnapConfig): Promise<string[]> {
    const children = await util.promisify(fs.readdir)(config.mountDirectory);
    const result: string[] = [];

    for (const child of children) {
        if (child.startsWith('QNAP_')) {
            if (await isMounted(path.join(config.mountDirectory, child))) {
                result.push(child);
            }
        }
    }

    return result;
}

export function unmountDomain(
    config: QnapConfig,
    domain: string,
): Promise<void> {
    const directory = path.join(config.mountDirectory, `QNAP_${domain}`);

    return unmount(directory);
}

export function mountDomain(
    config: QnapConfig,
    domain: string,
    password: string,
): Promise<void> {
    const directory = path.join(config.mountDirectory, `QNAP_${domain}`);
    const options: MountOptions = {
        address: `//${config.hostname}/${domain}`,
        user: config.qnapUser,
        password,
    };

    return mount(directory, options);
}
