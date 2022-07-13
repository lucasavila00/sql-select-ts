import { absurd } from "fp-ts/lib/function";
import { proxy } from "./proxy";
import { castSafe, SafeString } from "./safe-string";
import {
    ScopeStorage,
    SelectionArrayCallbackShape,
    SelectionRecordCallbackShape,
} from "./types";
import { hole } from "./utils";
import { wrapAlias } from "./wrap-alias";
import { AliasedRows } from "./data-wrappers";

const prefixedProxy = (base: string) =>
    new Proxy(
        {
            SQL_PROXY_TARGET: true,
        },
        {
            get: function (_target, prop, _receiver): SafeString {
                return castSafe(
                    wrapAlias(base) + "." + wrapAlias(String(prop))
                );
            },
        }
    ) as any;

const upperProxy = (scope: ScopeStorage): any =>
    new Proxy(
        {
            SQL_PROXY_TARGET: true,
        },
        {
            get: function (_target, prop, _receiver): SafeString {
                if (String(prop) in scope) {
                    return prefixedProxy(String(prop));
                }
                return castSafe(wrapAlias(String(prop)));
            },
        }
    ) as any;

export const consumeRecordCallback = (
    f: SelectionRecordCallbackShape,
    scope: ScopeStorage
): AliasedRows<any> => {
    if (Array.isArray(f)) {
        return AliasedRows(
            Object.fromEntries(f.map((it) => [it, castSafe(wrapAlias(it))]))
        );
    }
    const result: any = (f as any)(upperProxy(scope));
    return AliasedRows(result);
};

export const consumeArrayCallback = (
    f: SelectionArrayCallbackShape,
    scope: ScopeStorage
): ReadonlyArray<SafeString> | SafeString => {
    const result: any = (f as any)(upperProxy(scope));
    console.error(result);
    return result;
};
