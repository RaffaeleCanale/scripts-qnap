import fs from 'fs/promises';
import path from 'path';
import { QnapConfig, QnapConfigSchema } from '~/config/QnapConfig';

const CONFIG_FILE_PATH = path.join(__dirname, '../../config.json');

export async function readConfig(): Promise<QnapConfig> {
    const file = await fs.readFile(CONFIG_FILE_PATH);

    return QnapConfigSchema.parse(JSON.parse(file.toString()));
}
