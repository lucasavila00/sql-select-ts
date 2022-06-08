import { hole, pipe } from "fp-ts/lib/function";
import * as NEA from "fp-ts/lib/NonEmptyArray";

type SafeString = string & { _tag: "SafeString" };

type Table<Scope> = {
  _tag: "Table";
  name: string;
};

type SelectStatement<Scope extends string, Selection extends string> = {
  _tag: "Query";
  from_: TableOrSubquery<any, any> | JoinClause<any, any>;
  selection: Record<Selection, SafeString>;
};

type JoinClauseTailItem = {
  _tag: "JoinClauseTailItem";
  joinOperator: string;
  tableOrSubquery: TableOrSubquery<any, any>;
  joinConstraint: string;
};

type JoinClause<Scope extends string, Selection extends string> = {
  _tag: "JoinClause";
  head: TableOrSubquery<Scope, Selection>;
  tail: NEA.NonEmptyArray<JoinClauseTailItem>;
};

type TableOrSubquery<Scope extends string, Selection extends string> =
  | SelectStatement<Scope, Selection>
  | Table<Selection>
  | JoinClause<Scope, Selection>;

const fromTable = <Selection extends string>(
  name: string
): TableOrSubquery<never, Selection> => ({
  _tag: "Table",
  name,
});

const proxy = new Proxy(
  {
    "*": "*",
  },
  {
    get: function (_target, prop, _receiver) {
      return String(prop);
    },
  }
);

const select =
  <Scope extends string, Selection extends string, NewSelection extends string>(
    f: (f: Record<Selection, SafeString>) => Record<NewSelection, SafeString>
  ) =>
  (
    source: TableOrSubquery<Scope, Selection>
  ): TableOrSubquery<Selection, NewSelection> => ({
    _tag: "Query",
    from_: source,
    selection: f(proxy as any),
  });

const q2 = pipe(
  fromTable<"col1" | "col2">("t1"),
  select((f) => ({ alias1: f.col1 })),
  (it) => it,
  select((f) => ({ alias2: f.alias1 }))
);

const printFrom_ = (q: TableOrSubquery<any, any>): string => {
  switch (q._tag) {
    case "JoinClause": {
      return "";
    }
    case "Query": {
      return `(${printPrintable(q)})`;
    }
    case "Table": {
      return `${q.name}`;
    }
  }
};

const printPrintable = (q: TableOrSubquery<any, any>): string => {
  switch (q._tag) {
    case "JoinClause": {
      return "";
    }
    case "Query": {
      const sel = Object.entries(q.selection)
        .map(([k, v]) => `${v} AS ${k}`)
        .join(",");
      return `SELECT ${sel} FROM ${printFrom_(q.from_)}`;
    }
    case "Table": {
      return `SELECT * FROM ${q.name}`;
    }
  }
};

console.log(pipe(q2, printPrintable));
