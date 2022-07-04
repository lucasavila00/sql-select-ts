import { SelectStatement } from "../classes/select-statement";
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError, TableOrSubquery } from "../types";

export const select =
    <
        NewSelection extends string,
        FromAlias extends string,
        FromSelection extends string,
        FromScope extends string,
        FromAmbigous extends string
    >(
        f: (
            f: Record<FromSelection, SafeString> & NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ) =>
    (
        from: TableOrSubquery<FromAlias, FromScope, FromSelection, FromAmbigous>
    ): SelectStatement<FromSelection, NewSelection> =>
        from.select(f as any) as any;
