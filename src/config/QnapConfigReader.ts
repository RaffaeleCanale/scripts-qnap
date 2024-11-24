import fs from 'fs/promises';
import path from 'path';
import { QnapConfig, QnapConfigSchema } from '~/config/QnapConfig';

const CONFIG_FILE_PATH = path.join(__dirname, '../../config.json');

let config: Promise<QnapConfig> | null = null;

export async function useConfig(): Promise<QnapConfig> {
    if (config === null) {
        config = readConfig();
    }

    return config;
}

async function readConfig(): Promise<QnapConfig> {
    const file = await fs.readFile(CONFIG_FILE_PATH);

    return QnapConfigSchema.parse(JSON.parse(file.toString()));
}
