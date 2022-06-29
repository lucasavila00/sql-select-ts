import { castSafe } from "./safe-string";

export const proxy = new Proxy(
    {
        SQL_PROXY_TARGET: true,
    },
    {
        get: function (_target, prop, _receiver) {
            return castSafe(String(prop));
        },
    }
) as any;

export const isTheProxyObject = (it: any): boolean => {
    return it?.SQL_PROXY_TARGET != null;
};
