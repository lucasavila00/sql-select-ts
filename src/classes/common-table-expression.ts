/**
 * @since 1.0.0
 */
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { CTE, NoSelectFieldsCompileError, TableOrSubquery } from "../types";
import { SelectStatement } from "./select-statement";
import { AliasedRows } from "../data-wrappers";
import { Table } from "./table";

type FilterStarting<
    All extends string,
    Start extends string
> = All extends `${Start}.${infer U}` ? U : never;

/**
 * @since 1.0.0
 */
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
    public static defineRenamed = <
        Selection extends string,
        Alias extends string
    >(
        select: SelectStatement<any, any>,
        alias: Alias,
        columns: ReadonlyArray<Selection>
    ): CommonTableExpressionFactory<`${Alias}.${Selection}`, Alias> =>
        new CommonTableExpressionFactory({
            ctes: [{ columns, alias, select }],
        });

    /*  @internal */
    public static define = <Selection extends string, Alias extends string>(
        select: SelectStatement<any, Selection>,
        alias: Alias
    ): CommonTableExpressionFactory<`${Alias}.${Selection}`, Alias> =>
        new CommonTableExpressionFactory({
            ctes: [{ columns: [], alias, select }],
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
    /**
     * @since 1.0.0
     */
    public with_ = <Selection2 extends string, Alias2 extends string>(
        select: (acc: {
            [K in Aliases]: Table<FilterStarting<Scope, K>, K>;
        }) => SelectStatement<any, Selection2>,
        alias: Alias2
    ): CommonTableExpressionFactory<
        `${Alias2}.${Selection2}` | Scope,
        Aliases | Alias2
    > => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[cte.alias] = Table.define([], cte.alias);
        }
        return this.copy().setCtes([
            ...this.__props.ctes,
            { columns: [], alias, select: select(oldMap) },
        ]) as any;
    };

    /**
     * @since 1.0.0
     */
    public withR = <Selection2 extends string, Alias2 extends string>(
        select: (acc: {
            [K in Aliases]: Table<FilterStarting<Scope, K>, K>;
        }) => SelectStatement<any, any>,
        alias: Alias2,
        columns: ReadonlyArray<Selection2>
    ): CommonTableExpressionFactory<
        `${Alias2}.${Selection2}` | Scope,
        Aliases | Alias2
    > => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[cte.alias] = Table.define([], cte.alias);
        }
        return this.copy().setCtes([
            ...this.__props.ctes,
            { columns, alias, select: select(oldMap) },
        ]) as any;
    };

    /**
     * @since 1.0.0
     */
    public selectThis = <
        NewSelection extends string,
        SelectedAlias extends Aliases
    >(
        f: (
            f: Record<
                Scope | FilterStarting<Scope, SelectedAlias>,
                SafeString
            > &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>,
        from: SelectedAlias
    ): SelectStatement<
        | FilterStarting<Scope, SelectedAlias>
        | `${SelectedAlias}.${FilterStarting<Scope, SelectedAlias>}`,
        NewSelection
    > =>
        SelectStatement.__fromCommonTableExpression(
            Table.define([], from) as any,
            [AliasedRows(f(proxy))],
            this.__props.ctes
        );

    public do = <A extends string, B extends string>(
        f: (acc: {
            [K in Aliases]: TableOrSubquery<
                K,
                Scope,
                FilterStarting<Scope, K>,
                any
            >;
        }) => SelectStatement<A, B>
    ): SelectStatement<A, B> => {
        const oldMap: any = {};
        for (const cte of this.__props.ctes) {
            oldMap[cte.alias] = Table.define([], cte.alias);
        }
        return f(oldMap).__setCtes(this.__props.ctes);
    };
}
