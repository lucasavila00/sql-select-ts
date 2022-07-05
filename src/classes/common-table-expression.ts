/**
 * @since 0.0.0
 */
import { SafeString } from "../safe-string";
import { NoSelectFieldsCompileError } from "../types";
import { hole } from "../utils";
import { SelectStatement } from "./select-statement";

export type CTE = {
    readonly columns: ReadonlyArray<string>;
    readonly alias: string;
    readonly select: SelectStatement<any, any>;
};

export type FilterStarting<
    All extends string,
    Start extends string
> = All extends `${Start}.${infer U}` ? U : never;
export class CommonTableExpressionFactory<
    Scope extends string,
    Aliases extends string
> {
    /* @internal */
    private constructor(
        /* @internal */
        public __props: {
            readonly ctes: ReadonlyArray<CTE>;
        }
    ) {}

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        select: SelectStatement<any, any>,
        alias: Alias,
        columns: ReadonlyArray<Selection> = []
    ): CommonTableExpressionFactory<`${Alias}.${Selection}`, Alias> =>
        new CommonTableExpressionFactory({
            ctes: [{ columns, alias, select }],
        });

    private copy = (): CommonTableExpressionFactory<Scope, Aliases> =>
        new CommonTableExpressionFactory({ ...this.__props });

    private setCtes = (ctes: ReadonlyArray<CTE>): this => {
        this.__props = {
            ...this.__props,
            ctes,
        };
        return this;
    };

    public with_ = <Selection2 extends string, Alias2 extends string>(
        select: SelectStatement<any, any>,
        alias: Alias2,
        columns: ReadonlyArray<Selection2> = []
    ): CommonTableExpressionFactory<
        `${Alias2}.${Selection2}` | Scope,
        Aliases | Alias2
    > =>
        this.copy().setCtes([
            ...this.__props.ctes,
            { columns, alias, select },
        ]) as any;

    /**
     * @since 0.0.0
     */
    public selectThis = <
        NewSelection extends string,
        SelectedAlias extends Aliases
    >(
        _f: (
            f: Record<
                Scope | FilterStarting<Scope, SelectedAlias>,
                SafeString
            > &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>,
        _from: SelectedAlias
    ): SelectStatement<
        FilterStarting<Scope, SelectedAlias> | Scope,
        NewSelection
    > => hole();
    // SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    // public select, where it chooses one of the CTEs or other table as source, creating CommonTableExpression
}
