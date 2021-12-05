import fs from 'fs';
import Joi from 'joi';
import path from 'path';
import util from 'util';
import { objSchema, validate } from '~/utils/ValidationUtils';

export interface QnapConfig {
    hostname: string;
    qnapUser: string;
    mountDirectory: string;
}

const QnapConfigSchema = objSchema<QnapConfig>({
    mountDirectory: Joi.string().required(),
    hostname: Joi.string().required(),
    qnapUser: Joi.string().default('admin'),
});

export async function readConfig(): Promise<QnapConfig> {
    const filePath = path.join(__dirname, '../../config.json');
    const data = await util.promisify(fs.readFile)(filePath);

    return validate(JSON.parse(data.toString()), QnapConfigSchema);
}
