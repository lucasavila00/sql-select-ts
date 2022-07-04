/**
 * @since 0.0.0
 */
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError } from "../types";
import { SelectStatement } from "./select-statement";

/**
 * @since 0.0.0
 */
export class CommonTableExpression<
    Scope extends string,
    Selection extends string
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            columns: string[];
            alias: string;
            select: SelectStatement<any, any>;
        }
    ) {}

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        select: SelectStatement<any, any>,
        alias: Alias,
        columns: Selection[] = []
    ): CommonTableExpression<`${Alias}.${Selection}`, Selection> =>
        new CommonTableExpression({ columns, alias, select });

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<Selection | Scope, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | Scope, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<Selection | Scope, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);
}
