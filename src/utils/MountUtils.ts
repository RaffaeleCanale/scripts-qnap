import fs from 'fs/promises';
import type { ShareDirectory } from '~/services/QnapShares';
import { Shell } from '~/utils/CmdUtils';

export interface MountOptions {
    address: string;
    user: string;
    password: string;
}

async function fileExists(file: string): Promise<boolean> {
    try {
        await fs.access(file);
        return true;
    } catch {
        return false;
    }
}

export async function isMounted(directory: string): Promise<boolean> {
    const result = await Shell.catProcMounts();
    return result.includes(directory);
}

export async function mount(
    directory: ShareDirectory,
    options: MountOptions,
): Promise<void> {
    // sudo mount -t cifs -o uid=$5,gid=$6,username="$__user",password="$__pass" "$1" "$2"

    if (await isMounted(directory)) {
        console.log(`${directory} is already mounted`);
        return;
    }

    const directoryExists = await fileExists(directory);
    if (directoryExists && (await fs.readdir(directory)).length > 0) {
        console.log(`${directory} already exists`);
        return;
    }

    if (!directoryExists) {
        await Shell.shareDirectory.mkdir(directory);
    }

    try {
        console.log(
            `Mounting ${options.address} at ${directory} with ${
                options.user
            }:${options.password.substring(0, 3)}****`,
        );
        const user = await Shell.getUidGid();
        await Shell.mount(directory, user, options);
    } catch (error) {
        await Shell.shareDirectory.rmdir(directory);
        throw error;
    }
}

export async function unmount(directory: ShareDirectory): Promise<void> {
    if (!(await isMounted(directory))) {
        console.log(`${directory} is not mounted`);
        if (await fileExists(directory)) {
            await Shell.shareDirectory.rmdir(directory);
        }
        return;
    }

    console.log(`Unmounting ${directory}`);
    await Shell.umount(directory);
    await Shell.shareDirectory.rmdir(directory);
}
