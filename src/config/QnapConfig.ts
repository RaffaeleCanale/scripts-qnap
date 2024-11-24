import { z } from 'zod';

export const QnapConfigSchema = z.strictObject({
    mountDirectory: z
        .string()
        .transform((value) => {
            if (value.endsWith('/')) {
                return value.slice(0, -1);
            }
            return value;
        })
        .brand('MountDirectory'),
    hostname: z.string(),
    qnapUser: z.string().default('admin'),
    qnapPassword: z.string().optional(),
    shell: z
        .strictObject({
            prefixWithSudo: z.boolean().default(false),
            mkdirPath: z.string().default('/usr/bin/mkdir'),
            rmdirPath: z.string().default('/usr/bin/rmdir'),
            mountPath: z.string().default('/usr/bin/mount'),
            umountPath: z.string().default('/usr/bin/umount'),
            uid: z.string().optional(),
            gid: z.string().optional(),
        })
        .default({}),
});

export type QnapConfig = z.infer<typeof QnapConfigSchema>;

export type MountDirectory = QnapConfig['mountDirectory'];
