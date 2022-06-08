import { hole, pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import { castSafe, SafeString } from "./safe-string";

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

type Table<_Selection> = {
    _tag: "Table";
    names: { name: string; alias: string }[];
};

const StarSymbol = "*" as const;
type StarSymbol = typeof StarSymbol;

type SelectStatement<
    With extends string,
    Scope extends string,
    Selection extends string
> = {
    _tag: "Query";
    from_: TableOrSubquery<any, any, any>;
    //    | JoinClause<any, any>;
    selection: (Record<Selection, SafeString> | StarSymbol)[];
    orderBy: SafeString[];
    limit: SafeString | null;
    where: SafeString[];
};

// type JoinClauseTailItem = {
//   _tag: "JoinClauseTailItem";
//   joinOperator: string;
//   tableOrSubquery: TableOrSubquery<any, any>;
//   joinConstraint: string;
// };

// type JoinClause<Scope extends string, Selection extends string> = {
//   _tag: "JoinClause";
//   head: TableOrSubquery<Scope, Selection>;
//   tail: NEA.NonEmptyArray<JoinClauseTailItem>;
// };

type TableOrSubquery<
    With extends string,
    Scope extends string,
    Selection extends string
> = SelectStatement<With, Scope, Selection> | Table<Selection>;
//   | JoinClause<Scope, Selection>;

export const fromTable = <Selection extends string, Alias extends string>(
    name: string,
    alias: Alias
): Table<Selection | `${Alias}.${Selection}`> => ({
    _tag: "Table",
    names: [{ name, alias }],
});

export const appendTable =
    <Selection2 extends string>(t2: Table<Selection2>) =>
    <Selection1 extends string>(
        t1: Table<Selection1>
    ): Table<
        Exclude<Selection1, Selection2> | Exclude<Selection2, Selection1>
    > => ({
        ...t1,
        names: [...t1.names, ...t2.names],
    });

export const selectStar = <
    With extends string,
    Scope extends string,
    Selection extends string
>(
    source: TableOrSubquery<With, Scope, Selection>
): SelectStatement<never, Selection, Selection> => ({
    _tag: "Query",
    from_: source,
    selection: [StarSymbol],
    orderBy: [],
    limit: null,
    where: [],
});

export const appendSelectStar = <
    With extends string,
    Scope extends string,
    Selection extends string
>(
    source: SelectStatement<With, Scope, Selection>
): SelectStatement<With, Scope, Selection> => ({
    ...source,
    selection: [...source.selection, StarSymbol],
});

export const appendSelect =
    <
        With extends string,
        Scope extends string,
        Selection extends string,
        NewSelection extends string
    >(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ) =>
    (
        source: SelectStatement<With, Scope, Selection>
    ): SelectStatement<With, Scope, Selection | NewSelection> => ({
        ...source,
        selection: [...(source.selection as any), f(proxy as any)],
    });

export const select =
    <
        With extends string,
        Scope extends string,
        Selection extends string,
        NewSelection extends string
    >(
        f: (
            f: Record<Selection, SafeString>
        ) => Record<NewSelection, SafeString>
    ) =>
    (
        source: TableOrSubquery<With, Scope, Selection>
    ): SelectStatement<never, Selection, NewSelection> => ({
        _tag: "Query",
        from_: source,
        selection: [f(proxy as any)],
        orderBy: [],
        limit: null,
        where: [],
    });

const makeArray = <T>(it: T | T[]): T[] => {
    if (Array.isArray(it)) {
        return it;
    }
    return [it];
};

export const where =
    <With extends string, Scope extends string, Selection extends string>(
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ) =>
    (
        it: SelectStatement<With, Scope, Selection>
    ): SelectStatement<With, Scope, Selection> => ({
        ...it,
        where: [...it.where, ...makeArray(f(proxy as any))],
    });

export const orderBy =
    <With extends string, Scope extends string, Selection extends string>(
        f: (
            fields: Record<Scope | Selection, SafeString>
        ) => SafeString[] | SafeString
    ) =>
    (
        it: SelectStatement<With, Scope, Selection>
    ): SelectStatement<With, Scope, Selection> => ({
        ...it,
        orderBy: [...it.orderBy, ...makeArray(f(proxy as any))],
    });

const printFrom_ = (q: TableOrSubquery<any, any, any>): string => {
    switch (q._tag) {
        // case "JoinClause": {
        //   return "";
        // }
        case "Query": {
            return `(${printPrintable(q)})`;
        }
        case "Table": {
            return q.names
                .map((it) => {
                    if (it.name === it.alias) {
                        return it.name;
                    }
                    return `${it.name} AS ${it.alias}`;
                })
                .join(", ");
        }
    }
};

const printPrintable = (q: SelectStatement<any, any, any>): string => {
    const sel = pipe(
        q.selection,
        A.chain((it) => {
            // check if the proxy was returned in an identity function
            if ((it as any)?.SQL_PROXY_TARGET != null) {
                return ["*"];
            }
            if (it === StarSymbol) {
                return ["*"];
            }
            return Object.entries(it).map(([k, v]) => {
                return `${v.content} AS ${k}`;
            });
        }),
        (it) => it.join(", ")
    );

    const where =
        q.where.length > 0
            ? `WHERE ${q.where.map((it) => it.content).join(" AND ")}`
            : "";

    const orderBy =
        q.orderBy.length > 0
            ? `ORDER BY ${q.orderBy.map((it) => it.content).join(", ")}`
            : "";

    return [`SELECT ${sel}`, `FROM ${printFrom_(q.from_)}`, where, orderBy]
        .filter((it) => it.length > 0)
        .join(" ");
};

export const qToString = (q: SelectStatement<any, any, any>): string =>
    `${printPrintable(q)};`;
