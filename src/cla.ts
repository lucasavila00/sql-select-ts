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

const AliasedRowsURI = "AliasedRows" as const;
type AliasedRows<Selection extends string> = {
    _tag: typeof AliasedRowsURI;
    content: Record<Selection, SafeString>;
};

type JoinNames = {
    code: string;
    alias: string;
}[];
class JoinClause<Selection extends string> {
    private constructor(private names: JoinNames) {}

    public static fromNames = (names: JoinNames) => new JoinClause(names);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy as any) },
        ]);

    public selectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.fromTableOrSubquery(this, [
            { _tag: StarSymbolURI, distinct },
        ]);

    public crossJoinTable = <Selection2 extends string>(
        t2: Table<Selection2>
    ): JoinClause<
        Exclude<Selection, Selection2> | Exclude<Selection2, Selection>
    > =>
        JoinClause.fromNames([
            ...this.names,
            {
                code: t2.name,
                alias: t2.alias,
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
        | `${Alias2}.${Selection2}`
    > =>
        JoinClause.fromNames([
            ...this.names,
            {
                code: t2.printProtected(),
                alias: alias,
            },
        ]);

    public printProtected = (): string =>
        this.names
            .map((it) => {
                if (it.code === it.alias) {
                    return it.code;
                }
                return `${it.code} AS ${wrapAlias(it.alias)}`;
            })
            .join(", ");
}

export class Table<Selection extends string> {
    private constructor(public alias: string, public name: string) {}

    public static define = <
        Selection extends string,
        Alias extends string = never
    >(
        columns: Selection[],
        alias: Alias,
        name: string = alias
    ): Table<Selection | `${Alias}.${Selection}`> => new Table(alias, name);

    private copy = (): Table<Selection> => new Table(this.alias, this.name);

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy as any) },
        ]);

    public selectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.fromTableOrSubquery(this, [
            { _tag: StarSymbolURI, distinct },
        ]);

    public crossJoinTable = <Selection2 extends string>(
        t2: Table<Selection2>
    ): JoinClause<
        Exclude<Selection, Selection2> | Exclude<Selection2, Selection>
    > =>
        JoinClause.fromNames([
            {
                code: this.name,
                alias: this.alias,
            },
            {
                code: t2.name,
                alias: t2.alias,
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
        | `${Alias2}.${Selection2}`
    > =>
        JoinClause.fromNames([
            {
                code: this.name,
                alias: this.alias,
            },
            {
                code: t2.printProtected(),
                alias: alias,
            },
        ]);

    public printProtected = (): string => {
        if (this.name === this.alias) {
            return this.name;
        }
        return `${this.name} AS ${wrapAlias(this.alias)}`;
    };
}

type TableOrSubquery<
    With extends string,
    Scope extends string,
    Selection extends string
> =
    | SelectStatement<With, Scope, Selection>
    | Table<Selection>
    | JoinClause<Selection>;

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
        public from_: TableOrSubquery<any, any, any> | null,
        public selection_: SelectStatementSelection<Selection>,
        public orderBy_: SafeString[],
        public limit_: SafeString | number | null,
        public where_: SafeString[]
    ) {}

    public static fromTableOrSubquery = <
        With2 extends string,
        Scope2 extends string,
        Selection2 extends string,
        NewSelection extends string
    >(
        it: TableOrSubquery<With2, Scope2, Selection2>,
        selection: SelectStatementSelection<NewSelection>
    ): SelectStatement<never, Selection2, NewSelection> =>
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
            this.from_,
            this.selection_,
            this.orderBy_,
            this.limit_,
            this.where_
        );

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        SelectStatement.fromTableOrSubquery(this, [
            { _tag: AliasedRowsURI, content: f(proxy as any) },
        ]);

    public selectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> =>
        SelectStatement.fromTableOrSubquery(this, [
            { _tag: StarSymbolURI, distinct },
        ]);

    public appendSelectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> => {
        const t = this.copy();
        t.selection_ = [
            ...t.selection_,
            {
                _tag: StarSymbolURI,
                distinct,
            },
        ];
        return t;
    };

    public appendSelect = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<With, Scope, Selection | NewSelection> => {
        const t = this.copy();
        t.selection_ = [
            ...(t.selection_ as any),
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
        t.where_ = [...t.where_, ...makeArray(f(proxy as any))];
        return t;
    };

    public orderBy = (
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.orderBy_ = [...t.orderBy_, ...makeArray(f(proxy as any))];
        return t;
    };
    public limit = (
        limit: SafeString | number
    ): SelectStatement<With, Scope, Selection> => {
        const t = this.copy();
        t.limit_ = limit;
        return t;
    };

    public crossJoinTable = <Selection2 extends string, Alias2 extends string>(
        thisQueryAlias: Alias2,
        t2: Table<Selection2>
    ): JoinClause<
        | Exclude<Selection, Selection2>
        | Exclude<Selection2, Selection>
        | `${Alias2}.${Selection}`
    > =>
        JoinClause.fromNames([
            {
                code: this.printProtected(),
                alias: thisQueryAlias,
            },
            {
                code: t2.name,
                alias: t2.alias,
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
        | `${Alias1}.${Selection}`
    > =>
        JoinClause.fromNames([
            {
                code: this.printProtected(),
                alias: thisQueryAlias,
            },
            {
                code: t2.printProtected(),
                alias: t2Alias,
            },
        ]);

    private printSelectStatement = (): string => {
        const sel = pipe(
            this.selection_,
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
            this.where_.length > 0
                ? `WHERE ${this.where_.map((it) => it.content).join(" AND ")}`
                : "";

        const orderBy =
            this.orderBy_.length > 0
                ? `ORDER BY ${this.orderBy_.map((it) => it.content).join(", ")}`
                : "";

        const limit = this.limit_
            ? isNumber(this.limit_)
                ? `LIMIT ${this.limit_}`
                : `LIMIT ${this.limit_.content}`
            : "";

        const from =
            this.from_ != null ? `FROM ${this.from_.printProtected()}` : "";

        return [`SELECT ${sel}`, from, where, orderBy, limit]
            .filter((it) => it.length > 0)
            .join(" ");
    };
    public printProtected = (): string => `(${this.printSelectStatement()})`;

    public print = (): string => `${this.printSelectStatement()};`;
}
