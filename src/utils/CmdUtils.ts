import { exec, spawn } from 'child_process';

export function executeCommand(command: string, cwd?: string): Promise<string> {
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

export function executeInteractiveCommand(
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
                reject(new Error(`Command failed with code ${code}`));
            } else {
                resolve();
            }
        });
    });
}
