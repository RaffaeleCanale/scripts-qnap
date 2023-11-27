import fs from 'fs/promises';
import { executeCommand, executeInteractiveCommand } from '~/utils/CmdUtils';

export interface MountOptions {
    address: string;
    user: string;
    password: string;
}

async function fileExists(file: string): Promise<boolean> {
    try {
        await fs.access(file);
        return Promise.resolve(true);
    } catch (error) {
        return false;
    }
}

export async function isMounted(directory: string): Promise<boolean> {
    const result = await executeCommand('cat /proc/mounts');
    return result.includes(directory);
}

export async function mount(
    directory: string,
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
        await executeInteractiveCommand(['sudo', 'mkdir', directory]);
    }

    try {
        console.log(
            `Mounting ${options.address} at ${directory} with ${
                options.user
            }:${options.password.substring(0, 3)}****`,
        );
        await executeInteractiveCommand([
            'sudo',
            'mount',
            '-t',
            'cifs',
            '-o',
            `uid=1000,gid=1000,username=${options.user},password=${options.password}`,
            options.address,
            directory,
        ]);
    } catch (error) {
        await executeInteractiveCommand(['sudo', 'rmdir', directory]);
        throw error;
    }
}

export async function unmount(directory: string): Promise<void> {
    if (!(await isMounted(directory))) {
        console.log(`${directory} is not mounted`);
        if (await fileExists(directory)) {
            await executeCommand(`sudo rmdir ${directory}`);
        }
        return;
    }

    console.log(`Unmounting ${directory}`);
    await executeInteractiveCommand(['sudo', 'umount', directory]);
    await executeCommand(`sudo rmdir ${directory}`);
}
