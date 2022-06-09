import { castSafe, SafeString, sql } from "./safe-string";
import { hole, pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import { isNumber } from "fp-ts/lib/number";

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

class JoinClause<Selection extends string> {
    constructor(
        private names: {
            code: string;
            alias: string;
        }[]
    ) {}

    public select = <NewSelection extends string>(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ): SelectStatement<never, Selection, NewSelection> =>
        new SelectStatement(
            //
            this,
            [{ _tag: AliasedRowsURI, content: f(proxy as any) }],
            [],
            null,
            []
        );

    public selectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> =>
        new SelectStatement(
            //
            this,
            [{ _tag: StarSymbolURI, distinct }],
            [],
            null,
            []
        );

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
    private constructor(private alias: string, private name: string) {}

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
        new SelectStatement(
            //
            this,
            [{ _tag: AliasedRowsURI, content: f(proxy as any) }],
            [],
            null,
            []
        );

    public selectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> =>
        new SelectStatement(
            //
            this,
            [{ _tag: StarSymbolURI, distinct }],
            [],
            null,
            []
        );

    public crossJoinTable = <Selection2 extends string>(
        t2: Table<Selection2>
    ): JoinClause<
        Exclude<Selection, Selection2> | Exclude<Selection2, Selection>
    > =>
        new JoinClause([
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
        new JoinClause([
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
export class SelectStatement<
    With extends string,
    Scope extends string,
    Selection extends string
> {
    constructor(
        public from_: TableOrSubquery<any, any, any> | null,

        public selection_: (AliasedRows<Selection> | StarSymbol)[],
        public orderBy_: SafeString[],
        public limit_: SafeString | number | null,
        public where_: SafeString[]
    ) {}

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
        new SelectStatement(
            this,
            [{ _tag: AliasedRowsURI, content: f(proxy as any) }],
            [],
            null,
            []
        );

    public selectStar = (
        distinct: boolean = false
    ): SelectStatement<never, Selection, Selection> =>
        new SelectStatement(
            this,
            [{ _tag: StarSymbolURI, distinct }],
            [],
            null,
            []
        );

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
