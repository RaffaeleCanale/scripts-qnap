import { Command } from 'commander';
import ping from 'ping';
import { useConfig } from './config/QnapConfigReader.ts';
import { loadConfig } from './config/WxSecrets.ts';
import { PasswordManager } from './services/PasswordManager.ts';
import {
    getMountedShares,
    mountShare,
    unmountShare,
} from './services/QnapShares.ts';
import { exportSudoers } from './utils/CmdUtils.ts';

function addCommand(
    program: Command,
    action: (...args: any[]) => void | Promise<void>,
): void {
    program.action(async (...args) => {
        try {
            await action(...args);
        } catch (error) {
            console.error((error as Error).message);
            process.exit(1);
        }
    });
}

const program = new Command();

program.name('qnap').version('0.0.1');

addCommand(
    program.command('status').description('List all the mounted shares.'),
    async () => {
        await loadConfig(false);
        const config = useConfig();
        const mountedShares = await getMountedShares(config);

        console.log(
            'Mounted shares:\n\n' +
                mountedShares.map((share) => `  - ${share}`).join('\n'),
        );
    },
);

// addCommand(
//     program.command('clear-password').description('Clear stored password.'),
//     async () => {
//         await PasswordManager.clearQnapPassword();
//     },
// );

addCommand(
    program.command('generate-sudoers').description('Generate sudoers file.'),
    async () => {
        const sudoers = await exportSudoers();
        console.log(sudoers);
    },
);

addCommand(
    program.command('mount <shares...>').description('mount the given shares.'),
    async (shares) => {
        await loadConfig(true);
        const config = useConfig();
        const password = PasswordManager.getQnapPassword(config);

        for (const share of shares) {
            await mountShare(config, share, password);
        }
    },
);

addCommand(
    program
        .command('unmount <shares...>')
        .description('Unmount the given shares.'),
    async (shares) => {
        await loadConfig(false);
        const config = useConfig();
        for (const share of shares) {
            await unmountShare(config, share);
        }
    },
);

addCommand(
    program.command('unmount-all').description('Unmount the given shares.'),
    async () => {
        await loadConfig(false);
        const config = useConfig();
        const mountedShares = await getMountedShares(config);

        for (const share of mountedShares) {
            await unmountShare(config, share);
        }
    },
);

addCommand(program.command('ping').description('Pings the NAS.'), async () => {
    await loadConfig(false);
    const config = useConfig();
    console.log(`Pinging NAS (${config.hostname})...`);
    const response = await ping.promise.probe(config.hostname);
    if (!response.alive) {
        throw new Error('NAS is not reachable.');
    }
});

program.parse(process.argv);
