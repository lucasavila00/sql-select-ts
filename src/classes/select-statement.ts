import {
    AliasedRows,
    SelectStarArgs,
    StarOfAliasSymbol,
    StarSymbol,
} from "../data-wrappers";
import { printSelectStatement } from "../print";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery } from "../types";
import { makeArray } from "../utils";
import { Joined } from "./joined";
import { Table } from "./table";

type SelectionWrapperTypes<Selection extends string> = (
    | AliasedRows<Selection>
    | StarSymbol
    | StarOfAliasSymbol
)[];

export class SelectStatement<
    With extends string,
    Scope extends string,
    Selection extends string
> {
    private constructor(
        /* @internal */
        public __from: TableOrSubquery<any, any, any, any> | null,
        /* @internal */
        public __selection: SelectionWrapperTypes<Selection>,
        /* @internal */
        public __orderBy: SafeString[],
        /* @internal */
        public __limit: SafeString | number | null,
        /* @internal */
        public __where: SafeString[]
    ) {}

    /* @internal */
    public static __fromTableOrSubquery = (
        it: TableOrSubquery<any, any, any, any>,
        selection: SelectionWrapperTypes<any>
    ): SelectStatement<any, any, any> =>
        new SelectStatement(
            //
            it,
            selection,
            [],
            null,
            []
        );

    public static fromNothing = <NewSelection extends string>(
        it: Record<NewSelection, SafeString>
    ): SelectStatement<never, never, NewSelection> =>
        new SelectStatement(null, [AliasedRows(it)], [], null, []);

    private copy = (): SelectStatement<With, Scope, Selection> =>
        new SelectStatement(
            this.__from,
            this.__selection,
            this.__orderBy,
            this.__limit,
            this.__where
        );

    private setSelection = (
        selection: SelectionWrapperTypes<Selection>
    ): this => {
        this.__selection = selection;
        return this;
    };

    private setWhere = (where: SafeString[]): this => {
        this.__where = where;
        return this;
    };

    private setOrderBy = (orderBy: SafeString[]): this => {
        this.__orderBy = orderBy;
        return this;
    };
    private setLimit = (limit: SafeString | number | null): this => {
        this.__limit = limit;
        return this;
    };

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `main_alias.${Selection}`, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<
        never,
        Selection | `main_alias.${Selection}`,
        NewSelection
    > => SelectStatement.__fromTableOrSubquery(this, [AliasedRows(f(proxy))]);

    public selectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol(args)]);

    public appendSelectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> =>
        this.copy().setSelection([...this.__selection, StarSymbol(args)]);

    public appendSelect = <NewSelection extends string>(
        f: (
            f: Record<Selection | Scope, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<With, Scope, Selection | NewSelection> =>
        this.copy().setSelection([
            ...(this.__selection as any),
            AliasedRows(f(proxy)),
        ]) as any;

    public where = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<With, Scope, Selection> =>
        this.copy().setWhere([...this.__where, ...makeArray(f(proxy))]);

    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<With, Scope, Selection> =>
        this.copy().setOrderBy([...this.__orderBy, ...makeArray(f(proxy))]);

    public limit = (
        limit: SafeString | number
    ): SelectStatement<With, Scope, Selection> => this.copy().setLimit(limit);

    public commaJoinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        table: Table<Selection2, Alias2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisQueryAlias,
            },
            {
                code: table,
                alias: table.__alias,
            },
        ]);

    public joinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        operator: string,
        table: Table<Selection2, Alias2>,
        on?: (
            f: Record<
                | Exclude<Selection, Selection2>
                | Exclude<Selection2, Selection>
                | `${Alias1}.${Selection}`
                | `${Alias2}.${Selection2}`,
                SafeString
            >
        ) => SafeString | SafeString[]
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`
        | `${Alias2}.${Selection2}`,
        Alias1 | Alias2
    > =>
        Joined.__fromAll(
            [
                {
                    code: this,
                    alias: thisQueryAlias,
                },
            ],
            [
                {
                    code: table,
                    alias: table.__alias,
                    operator,
                    constraint: on != null ? makeArray(on(proxy)) : [],
                },
            ]
        );

    public commaJoinQuery = <
        Alias1 extends string,
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        tableAlias: Alias2,
        table: SelectStatement<With2, Scope2, Selection2>
    ): Joined<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2
    > =>
        Joined.__fromCommaJoin([
            {
                code: this,
                alias: thisQueryAlias,
            },
            {
                code: table,
                alias: tableAlias,
            },
        ]);

    public print = (): string => printSelectStatement(this);
}
export const fromNothing = SelectStatement.fromNothing;
