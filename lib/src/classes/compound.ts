/**
 * Represents https://www.sqlite.org/syntax/compound-operator.html
 *
 * @since 0.0.0
 */
import { AliasedRows, StarSymbol } from "../data-wrappers";
import { printCompound } from "../print";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery, NoSelectFieldsCompileError } from "../types";
import { makeArray } from "../utils";
import { JoinedFactory } from "./joined";
import { SelectStatement } from "./select-statement";
import { Table } from "./table";

type SelectionOfSelectStatement<T> = T extends SelectStatement<
    infer _With,
    infer _Scope,
    infer Selection
>
    ? Selection
    : never;

/**
 * Represents https://www.sqlite.org/syntax/compound-operator.html
 *
 * @since 0.0.0
 */
export class Compound<Scope extends string, Selection extends string> {
    /* @internal */
    private constructor(
        /* @internal */
        public __content: TableOrSubquery<any, any, any, any>[],
        /* @internal */
        public __qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT",
        /* @internal */
        public __orderBy: SafeString[],
        /* @internal */
        public __limit: SafeString | number | null
    ) {}

    /**
     * @internal
     */
    public static union = <
        C extends SelectStatement<any, any, any>,
        CS extends SelectStatement<any, any, any>[]
    >(
        content: [C, ...CS]
    ): Compound<
        SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
        SelectionOfSelectStatement<C>
    > => new Compound(content, "UNION", [], null);

    /**
     * @internal
     */
    public static unionAll = <
        C extends SelectStatement<any, any, any>,
        CS extends SelectStatement<any, any, any>[]
    >(
        content: [C, ...CS]
    ): Compound<
        SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
        SelectionOfSelectStatement<C>
    > => new Compound(content, "UNION ALL", [], null);

    private copy = (): Compound<Scope, Selection> =>
        new Compound(
            this.__content,
            this.__qualifier,
            this.__orderBy,
            this.__limit
        );

    private setOrderBy = (orderBy: SafeString[]): this => {
        this.__orderBy = orderBy;
        return this;
    };
    private setLimit = (limit: SafeString | number | null): this => {
        this.__limit = limit;
        return this;
    };

    /**
     * @since 0.0.0
     */
    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): Compound<Scope, Selection> =>
        this.copy().setOrderBy([...this.__orderBy, ...makeArray(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public limit = (limit: SafeString | number): Compound<Scope, Selection> =>
        this.copy().setLimit(limit);

    /**
     * @since 0.0.0
     */
    public select = <NewSelection extends string>(
        f: (
            fields: Record<Selection | `main_alias.${Selection}`, SafeString> &
                NoSelectFieldsCompileError
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<
        never,
        Selection | `main_alias.${Selection}`,
        NewSelection
    > => SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    /**
     * @since 0.0.0
     */
    public selectStar = (): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol()]);

    /**
     * @since 0.0.0
     */
    public joinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        operator: string,
        table: Table<Selection2, Alias2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisSelectAlias,
                },
            ],
            [],
            {
                code: table,
                alias: table.__alias,
                operator,
            }
        );

    /**
     * @since 0.0.0
     */
    public joinSelect = <
        Alias1 extends string,
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisSelectAlias: Alias1,
        operator: string,
        selectAlias: Alias2,
        select: SelectStatement<With2, Scope2, Selection2>
    ): JoinedFactory<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2,
        Extract<Selection2, Selection>
    > =>
        JoinedFactory.__fromAll(
            [
                {
                    code: this,
                    alias: thisSelectAlias,
                },
            ],
            [],
            {
                code: select,
                alias: selectAlias,
                operator,
            }
        );

    /**
     * @since 0.0.0
     */
    public print = (): string => printCompound(this);
}
