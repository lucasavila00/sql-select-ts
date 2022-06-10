import { pipe } from "fp-ts/lib/function";
import { isNumber } from "fp-ts/lib/number";
import {
    AliasedRows,
    StarSymbol,
    StarOfAliasSymbol,
    AliasedRowsURI,
    SelectStarArgs,
    isStarSymbol,
    isStarOfAliasSymbol,
} from "../data-wrappers";
import { proxy } from "../proxy";
import { SafeString } from "../safe-string";
import { TableOrSubquery } from "../types";
import { makeArray, wrapAlias } from "../utils";
import { Joined } from "./joined";
import { Table } from "./table";
import * as A from "fp-ts/lib/Array";

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
        public __from: TableOrSubquery<any, any, any, any> | null,
        public __selection: SelectionWrapperTypes<Selection>,
        public __orderBy: SafeString[],
        public __limit: SafeString | number | null,
        public __where: SafeString[]
    ) {}

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
        new SelectStatement(
            null,
            [
                {
                    _tag: AliasedRowsURI,
                    content: it,
                },
            ],
            [],
            null,
            []
        );

    private copy = (): SelectStatement<With, Scope, Selection> =>
        new SelectStatement(
            this.__from,
            this.__selection,
            this.__orderBy,
            this.__limit,
            this.__where
        );

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection | `main_alias.${Selection}`, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<
        never,
        Selection | `main_alias.${Selection}`,
        NewSelection
    > =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy) },
        ]);

    public selectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol(args)]);

    public appendSelectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> => {
        const t = this.copy();
        t.__selection = [...t.__selection, StarSymbol(args)];
        return t;
    };

    public appendSelect = <NewSelection extends string>(
        f: (
            f: Record<Selection | Scope, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<With, Scope, Selection | NewSelection> => {
        const t = this.copy();
        t.__selection = [
            ...(t.__selection as any),
            {
                _tag: AliasedRowsURI,
                content: f(proxy),
            },
        ];
        return t as any;
    };

    public where = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.__where = [...t.__where, ...makeArray(f(proxy))];
        return t;
    };

    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.__orderBy = [...t.__orderBy, ...makeArray(f(proxy))];
        return t;
    };

    public limit = (
        limit: SafeString | number
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.__limit = limit;
        return t;
    };

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
        Joined.__fromCommaJoinHead([
            {
                code: this.__printProtected(true),
                alias: thisQueryAlias,
            },
            {
                code: table.__name,
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
        Joined.__fromProperJoin(
            [
                {
                    code: this.__printProtected(true),
                    alias: thisQueryAlias,
                },
            ],
            [
                {
                    code: table.__name,
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
        Joined.__fromCommaJoinHead([
            {
                code: this.__printProtected(true),
                alias: thisQueryAlias,
            },
            {
                code: table.__printProtected(true),
                alias: tableAlias,
            },
        ]);

    private printSelectStatement = (): string => {
        const sel = pipe(
            this.__selection,
            A.chain((it) => {
                if (isStarSymbol(it)) {
                    if (it.distinct) {
                        return ["DISTINCT *"];
                    }
                    return ["*"];
                }
                if (isStarOfAliasSymbol(it)) {
                    const content = it.aliases.map((alias) => `${alias}.*`);
                    if (it.distinct) {
                        return [`DISTINCT ${content.join(", ")}`];
                    }
                    return content;
                }
                // check if the proxy was returned in an identity function
                if ((it.content as any)?.SQL_PROXY_TARGET != null) {
                    return ["*"];
                }
                return Object.entries(it.content).map(([k, v]) => {
                    return `${(v as SafeString).content} AS ${wrapAlias(k)}`;
                });
            }),
            (it) => it.join(", ")
        );

        const where =
            this.__where.length > 0
                ? `WHERE ${this.__where.map((it) => it.content).join(" AND ")}`
                : "";

        const orderBy =
            this.__orderBy.length > 0
                ? `ORDER BY ${this.__orderBy
                      .map((it) => it.content)
                      .join(", ")}`
                : "";

        const limit = this.__limit
            ? isNumber(this.__limit)
                ? `LIMIT ${this.__limit}`
                : `LIMIT ${this.__limit.content}`
            : "";

        const from =
            this.__from != null
                ? `FROM ${this.__from.__printProtected(true)}`
                : "";

        const doesSelectMainAlias = sel.includes("main_alias");

        const main_alias = doesSelectMainAlias ? "AS main_alias" : "";

        return [`SELECT ${sel}`, from, main_alias, where, orderBy, limit]
            .filter((it) => it.length > 0)
            .join(" ");
    };

    public __printProtected = (parenthesis: boolean): string =>
        parenthesis
            ? `(${this.printSelectStatement()})`
            : this.printSelectStatement();

    public print = (): string => `${this.__printProtected(false)};`;
}
export const fromNothing = SelectStatement.fromNothing;
