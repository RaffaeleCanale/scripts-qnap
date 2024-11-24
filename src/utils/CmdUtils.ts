import { exec, spawn } from 'child_process';
import { useConfig } from '~/config/QnapConfigReader';
import type { ShareDirectory } from '~/services/QnapShares';
import type { MountOptions } from '~/utils/MountUtils';

function executeCommand(command: string, cwd?: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = exec(
            command,
            {
                cwd,
            },
            (error, stdout, stderr) => {
                if (error) {
                    reject(
                        new Error(
                            `Command ${command} failed:\n${stderr}${stdout}`,
                        ),
                    );
                } else {
                    resolve(stdout);
                }
            },
        );
    });
}

function executeInteractiveCommand(
    command: string[],
    cwd?: string,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const [cmd, ...args] = command;
        const shell = spawn(cmd, args, {
            cwd,
            stdio: 'inherit',
        });

        shell.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`Command failed with code ${code ?? '-'}`));
            } else {
                resolve();
            }
        });
    });
}

function addSudo(cond: boolean): string[] {
    return cond ? ['sudo'] : [];
}

async function useShellConfig() {
    return (await useConfig()).shell;
}

export const Shell = {
    secretTool: {
        lookup(namespace: string, key: string): Promise<string> {
            return executeCommand(`secret-tool lookup ${namespace} ${key}`);
        },
        store(namespace: string, key: string, value: string): Promise<string> {
            return executeCommand(
                `echo "${value}" | secret-tool store --label ${namespace}-${key} ${namespace} ${key}`,
            );
        },
        clear(namespace: string, key: string): Promise<string> {
            return executeCommand(`secret-tool clear ${namespace} ${key}`);
        },
    },

    catProcMounts(): Promise<string> {
        return executeCommand('cat /proc/mounts');
    },

    shareDirectory: {
        async mkdir(directory: ShareDirectory): Promise<void> {
            const { prefixWithSudo, mkdirPath } = await useShellConfig();

            await executeInteractiveCommand([
                ...addSudo(prefixWithSudo),
                mkdirPath,
                directory,
            ]);
        },

        async rmdir(directory: ShareDirectory): Promise<void> {
            const { prefixWithSudo, rmdirPath } = await useShellConfig();

            await executeInteractiveCommand([
                ...addSudo(prefixWithSudo),
                rmdirPath,
                directory,
            ]);
        },
    },

    async mount(
        directory: ShareDirectory,
        user: { uid: string; gid: string },
        options: MountOptions,
    ) {
        const { prefixWithSudo, mountPath } = await useShellConfig();

        await executeInteractiveCommand([
            ...addSudo(prefixWithSudo),
            mountPath,
            '-t',
            'cifs',
            '-o',
            `uid=${user.uid},gid=${user.gid},username=${options.user},password=${options.password}`,
            options.address,
            directory,
        ]);
    },

    async umount(directory: ShareDirectory): Promise<void> {
        const { prefixWithSudo, umountPath } = await useShellConfig();
        return executeInteractiveCommand([
            ...addSudo(prefixWithSudo),
            umountPath,
            directory,
        ]);
    },

    async getUidGid(): Promise<{ uid: string; gid: string }> {
        const config = await useConfig();
        let { uid, gid } = config.shell;

        if (!uid) {
            uid = (await executeCommand('id -u')).replaceAll('\n', '').trim();
        }
        if (!gid) {
            gid = (await executeCommand('id -g')).replaceAll('\n', '').trim();
        }
        return { uid, gid };
    },
};

export async function exportSudoers(): Promise<string> {
    const { mountDirectory, shell } = await useConfig();
    const { mkdirPath, rmdirPath, mountPath, umountPath } = shell;
    const currentUser = (await executeCommand('whoami'))
        .replaceAll('\n', '')
        .trim();

    // <username> ALL=(ALL) NOPASSWD: /bin/mkdir /somewhere/that/requires/sudo

    const sharesDirectory: ShareDirectory = `${mountDirectory}/QNAP_*`;

    return [
        // mkdir
        `${currentUser} ALL=(ALL) NOPASSWD: ${mkdirPath} ${sharesDirectory}`,
        // rmdir
        `${currentUser} ALL=(ALL) NOPASSWD: ${rmdirPath} ${sharesDirectory}`,
        // mount
        `${currentUser} ALL=(ALL) NOPASSWD: ${mountPath}`,
        // umount
        `${currentUser} ALL=(ALL) NOPASSWD: ${umountPath}`,
    ].join('\n');
}
