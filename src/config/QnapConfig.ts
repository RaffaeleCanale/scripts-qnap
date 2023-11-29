import { z } from 'zod';

export const QnapConfigSchema = z.object({
    mountDirectory: z.string(),
    hostname: z.string(),
    qnapUser: z.string().default('admin'),
    qnapPassword: z.string().optional(),
    sudo: z.boolean().default(true),
});

export type QnapConfig = z.infer<typeof QnapConfigSchema>;
