/**
 * @since 0.0.0
 */
import { AliasedRows } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError } from "../types";
import { SelectStatement } from "./select-statement";

/**
 * @since 0.0.0
 */
export class CommonTableExpression<
    Selection extends string,
    Alias extends string
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __columns: string[],
        /* @internal */
        public __alias: string,
        /* @internal */
        public __select: SelectStatement<any, any>
    ) {}

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        select: SelectStatement<any, any>,
        alias: Alias,
        columns: Selection[] = []
    ): CommonTableExpression<Selection, Alias> =>
        new CommonTableExpression(columns, alias, select);

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `${Alias}.${Selection}`, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<Selection | `${Alias}.${Selection}`, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);
}
