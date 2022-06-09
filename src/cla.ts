import { castSafe, SafeString, sql } from "./safe-string";
import { hole, pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import { isNumber } from "fp-ts/lib/number";
import { string } from "fp-ts";

const proxy = new Proxy(
    {
        SQL_PROXY_TARGET: true,
    },
    {
        get: function (_target, prop, _receiver) {
            return castSafe(String(prop));
        },
    }
);
const StarSymbolURI = "*" as const;
type StarSymbol = { _tag: typeof StarSymbolURI; distinct: boolean };

type SelectStarArgs = {
    distinct?: boolean;
};
const StarSymbol = ({ distinct = false }: SelectStarArgs = {}): StarSymbol => ({
    _tag: StarSymbolURI,
    distinct,
});

const AliasedRowsURI = "AliasedRows" as const;
type AliasedRows<Selection extends string> = {
    _tag: typeof AliasedRowsURI;
    content: Record<Selection, SafeString>;
};

type CrossJoinHead = {
    code: string;
    alias: string;
}[];
class JoinClause<Selection extends string, Aliases extends string> {
    private constructor(private __crossJoins: CrossJoinHead) {}

    public static __fromCrossJoinHead = (crossJoins: CrossJoinHead) =>
        new JoinClause(crossJoins);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy as any) },
        ]);

    public selectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol(args)]);

    public crossJoinTable = <Selection2 extends string, Alias2 extends string>(
        t2: Table<Selection2, Alias2>
    ): JoinClause<
        Exclude<Selection, Selection2> | Exclude<Selection2, Selection>,
        Aliases | Alias2
    > =>
        JoinClause.__fromCrossJoinHead([
            ...this.__crossJoins,
            {
                code: t2.__name,
                alias: t2.__alias,
            },
        ]);

    public crossJoinQuery = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        alias: Alias2,
        t2: SelectStatement<With2, Scope2, Selection2>
    ): JoinClause<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Aliases | Alias2
    > =>
        JoinClause.__fromCrossJoinHead([
            ...this.__crossJoins,
            {
                code: t2.__printProtected(),
                alias: alias,
            },
        ]);

    public __printProtected = (): string =>
        this.__crossJoins
            .map((it) => {
                if (it.code === it.alias) {
                    return it.code;
                }
                return `${it.code} AS ${wrapAlias(it.alias)}`;
            })
            .join(", ");
}

class Table<Selection extends string, Alias extends string> {
    private constructor(public __alias: string, public __name: string) {}

    public static define = <
        Selection extends string,
        Alias extends string = never
    >(
        _columns: Selection[],
        alias: Alias,
        name: string = alias
    ): Table<Selection | `${Alias}.${Selection}`, Alias> =>
        new Table(alias, name);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy as any) },
        ]);

    public selectStar = (
        args?: SelectStarArgs
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.__fromTableOrSubquery(this, [StarSymbol(args)]);

    public crossJoinTable = <Selection2 extends string, Alias2 extends string>(
        t2: Table<Selection2, Alias2>
    ): JoinClause<
        Exclude<Selection, Selection2> | Exclude<Selection2, Selection>,
        Alias | Alias2
    > =>
        JoinClause.__fromCrossJoinHead([
            {
                code: this.__name,
                alias: this.__alias,
            },
            {
                code: t2.__name,
                alias: t2.__alias,
            },
        ]);

    public crossJoinQuery = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        alias: Alias2,
        t2: SelectStatement<With2, Scope2, Selection2>
    ): JoinClause<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`,
        Alias | Alias2
    > =>
        JoinClause.__fromCrossJoinHead([
            {
                code: this.__name,
                alias: this.__alias,
            },
            {
                code: t2.__printProtected(),
                alias: alias,
            },
        ]);

    public __printProtected = (): string => {
        if (this.__name === this.__alias) {
            return this.__name;
        }
        return `${this.__name} AS ${wrapAlias(this.__alias)}`;
    };
}

type TableOrSubquery<
    Alias extends string,
    With extends string,
    Scope extends string,
    Selection extends string
> =
    | SelectStatement<With, Scope, Selection>
    | Table<Alias, Selection>
    | JoinClause<Alias, Selection>;

const wrapAlias = (alias: string) => {
    if (alias[0].charCodeAt(0) >= 48 && alias[0].charCodeAt(0) <= 57) {
        return `\`${alias}\``;
    }
    if (alias.includes(" ")) {
        return `\`${alias}\``;
    }
    return alias;
};
const makeArray = <T>(it: T | T[]): T[] => {
    if (Array.isArray(it)) {
        return it;
    }
    return [it];
};

type SelectStatementSelection<Selection extends string> = (
    | AliasedRows<Selection>
    | StarSymbol
)[];

export class SelectStatement<
    With extends string,
    Scope extends string,
    Selection extends string
> {
    private constructor(
        public __from: TableOrSubquery<any, any, any, any> | null,
        public __selection: SelectStatementSelection<Selection>,
        public __orderBy: SafeString[],
        public __limit: SafeString | number | null,
        public __where: SafeString[]
    ) {}

    public static __fromTableOrSubquery = (
        it: TableOrSubquery<any, any, any, any>,
        selection: SelectStatementSelection<any>
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
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.__fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy as any) },
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
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<With, Scope, Selection | NewSelection> => {
        const t = this.copy();
        t.__selection = [
            ...(t.__selection as any),
            {
                _tag: AliasedRowsURI,
                content: f(proxy as any),
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
        t.__where = [...t.__where, ...makeArray(f(proxy as any))];
        return t;
    };

    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.__orderBy = [...t.__orderBy, ...makeArray(f(proxy as any))];
        return t;
    };

    public limit = (
        limit: SafeString | number
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.__limit = limit;
        return t;
    };

    public crossJoinTable = <
        Alias1 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        t2: Table<Selection2, Alias2>
    ): JoinClause<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2
    > =>
        JoinClause.__fromCrossJoinHead([
            {
                code: this.__printProtected(),
                alias: thisQueryAlias,
            },
            {
                code: t2.__name,
                alias: t2.__alias,
            },
        ]);

    public crossJoinQuery = <
        Alias1 extends string,
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        Alias2 extends string
    >(
        thisQueryAlias: Alias1,
        t2Alias: Alias2,
        t2: SelectStatement<With2, Scope2, Selection2>
    ): JoinClause<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection2}`
        | `${Alias1}.${Selection}`,
        Alias1 | Alias2
    > =>
        JoinClause.__fromCrossJoinHead([
            {
                code: this.__printProtected(),
                alias: thisQueryAlias,
            },
            {
                code: t2.__printProtected(),
                alias: t2Alias,
            },
        ]);

    private printSelectStatement = (): string => {
        const sel = pipe(
            this.__selection,
            A.chain((it) => {
                if (it._tag === StarSymbolURI) {
                    if (it.distinct) {
                        return ["DISTINCT *"];
                    }
                    return ["*"];
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
            this.__from != null ? `FROM ${this.__from.__printProtected()}` : "";

        return [`SELECT ${sel}`, from, where, orderBy, limit]
            .filter((it) => it.length > 0)
            .join(" ");
    };

    public __printProtected = (): string => `(${this.printSelectStatement()})`;

    public print = (): string => `${this.printSelectStatement()};`;
}

export const fromNothing = SelectStatement.fromNothing;
export const fromTable = Table.define;
