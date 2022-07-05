import { proxy } from "./proxy";
import { castSafe, SafeString } from "./safe-string";
import { NoSelectFieldsCompileError } from "./types";
import { wrapAliasSplitDots } from "./wrap-alias";

export const consume = (
    f:
        | ReadonlyArray<string>
        | ((
              f: Record<string, SafeString> & NoSelectFieldsCompileError
          ) => Record<string, SafeString>)
) =>
    Array.isArray(f)
        ? Object.fromEntries(
              f.map((it) => [it, castSafe(wrapAliasSplitDots(it))])
          )
        : typeof f === "function"
        ? (f as any)(proxy)
        : { [String(f)]: castSafe(wrapAliasSplitDots(String(f))) };
