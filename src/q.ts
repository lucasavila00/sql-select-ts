import { pipe } from "fp-ts/lib/function";
import * as A from "fp-ts/lib/Array";
import * as Eq from "fp-ts/lib/Eq";
import { castSafe, SafeString } from "./safe-string";

type Table<Scope> = {
    _tag: "Table";
    names: string[];
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

export const fromTable = <Selection extends string>(
    name: string
): Table<Selection> => ({
    _tag: "Table",
    names: [name],
});

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
            return q.names.join(", ");
        }
    }
};

const printPrintable = (q: SelectStatement<any, any, any>): string => {
    const sel = pipe(
        q.selection,
        A.chain((it) => {
            if ((it as any).SQL_PROXY_TARGET != null) {
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

    return `SELECT ${sel} FROM ${printFrom_(q.from_)}`;
};

export const qToString = (q: SelectStatement<any, any, any>): string =>
    `${printPrintable(q)};`;
