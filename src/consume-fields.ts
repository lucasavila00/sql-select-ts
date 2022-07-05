import { absurd } from "fp-ts/lib/function";
import { proxy } from "./proxy";
import { castSafe, SafeString } from "./safe-string";
import { NoSelectFieldsCompileError } from "./types";
import { wrapAliasSplitDots } from "./wrap-alias";

export const consumeRecordCallback = (
    f:
        | ReadonlyArray<string>
        | ((
              f: Record<string, SafeString> & NoSelectFieldsCompileError
          ) => Record<string, SafeString>)
): Record<string, SafeString> =>
    Array.isArray(f)
        ? Object.fromEntries(
              f.map((it) => [it, castSafe(wrapAliasSplitDots(it))])
          )
        : typeof f === "function"
        ? (f as any)(proxy)
        : absurd(f as never);

export const consumeArrayCallback = (
    f:
        | ReadonlyArray<string>
        | ((
              fields: Record<string, SafeString>
          ) => ReadonlyArray<SafeString> | SafeString)
): ReadonlyArray<SafeString> | SafeString =>
    Array.isArray(f)
        ? f.map((it) => castSafe(wrapAliasSplitDots(it)))
        : typeof f === "function"
        ? (f as any)(proxy)
        : absurd(f as never);
