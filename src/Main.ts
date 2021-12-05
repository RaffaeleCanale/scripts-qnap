import { Command } from 'commander';
import prompts from 'prompts';
import { readConfig } from '~/config/QnapConfig';
import {
    getMountedDomains,
    mountDomain,
    unmountDomain,
} from '~/domains/QnapResource';

function addCommand(
    program: Command,
    action: (...args: any[]) => void | Promise<void>,
): void {
    program.action(async (...args) => {
        try {
            await action(...args);
        } catch (error) {
            console.error((error as Error).message);
        }
    });
}

const program = new Command();

program.name('qnap').version('0.0.1');

addCommand(
    program.command('status').description('List all the mounted domains.'),
    async () => {
        const config = await readConfig();
        const mountedDomains = await getMountedDomains(config);

        console.log(
            'Mounted domains:\n\n' +
                mountedDomains.map((domain) => `  - ${domain}`).join('\n'),
        );
    },
);

addCommand(
    program
        .command('mount <domains...>')
        .description('mount the given domains.'),
    async (domains) => {
        const config = await readConfig();
        const { password } = await prompts({
            type: 'password',
            name: 'password',
            message: 'Please enter the QNAP password:',
        });

        for (const domain of domains) {
            await mountDomain(config, domain, password);
        }
    },
);

addCommand(
    program
        .command('unmount <domains...>')
        .description('Unmount the given domains.'),
    async (domains) => {
        const config = await readConfig();
        for (const domain of domains) {
            await unmountDomain(config, domain);
        }
    },
);

program.parse(process.argv);
