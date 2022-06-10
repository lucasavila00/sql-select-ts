import { castSafe } from "./safe-string";

export const proxy = new Proxy(
    {},
    {
        get: function (_target, prop, _receiver) {
            return castSafe(String(prop));
        },
    }
) as any;
