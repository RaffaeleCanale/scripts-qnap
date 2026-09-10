import { type QnapConfig, QnapConfigSchema } from './QnapConfig.ts';
import { useProperties } from './WxSecrets.ts';

let config: QnapConfig | undefined = undefined;

export function useConfig(): QnapConfig {
    if (config !== undefined) {
        return config;
    }

    const properties = useProperties().getProperties();
    config = QnapConfigSchema.parse(properties);
    return config;
}
