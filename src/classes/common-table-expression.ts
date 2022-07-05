/**
 * @since 1.0.0
 */
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { CTE, NoSelectFieldsCompileError } from "../types";
import { SelectStatement } from "./select-statement";
import { AliasedRows } from "../data-wrappers";

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
    /**
     * @since 1.0.0
     */
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
        FilterStarting<Scope, SelectedAlias> | Scope,
        NewSelection
    > =>
        SelectStatement.__fromCommonTableExpression(
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.__props.ctes.find((it) => it.alias === from)!.select,
            [AliasedRows(f(proxy))],
            this.__props.ctes
        );
}
