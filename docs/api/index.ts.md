---
title: index.ts
nav_order: 7
parent: Api
layout: default
---

## index overview

Entry points of the library.

Added in v2.0.0

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# compound

## except

Creates a compound query using 'EXCEPT'

**Signature**

```ts
export declare const except: <
  C extends
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>,
  CS extends readonly (
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>
  )[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C>,
  never,
  ScopeOfSelectStatement<C> &
    UnionToIntersection<ScopeOfSelectStatement<CS[number]>>,
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>
>;
```

**Example**

```ts
import { fromNothing, dsql as sql, except } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = except([q1, q2]);
assert.strictEqual(u.stringify(), "SELECT 123 AS `a` EXCEPT SELECT 456 AS `a`");
```

Added in v2.0.0

## intersect

Creates a compound query using 'INTERSECT'

**Signature**

```ts
export declare const intersect: <
  C extends
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>,
  CS extends readonly (
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>
  )[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C>,
  never,
  ScopeOfSelectStatement<C> &
    UnionToIntersection<ScopeOfSelectStatement<CS[number]>>,
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>
>;
```

**Example**

```ts
import { fromNothing, dsql as sql, intersect } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = intersect([q1, q2]);
assert.strictEqual(
  u.stringify(),
  "SELECT 123 AS `a` INTERSECT SELECT 456 AS `a`"
);
```

Added in v2.0.0

## union

Creates a compound query using 'UNION'

**Signature**

```ts
export declare const union: <
  C extends
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>,
  CS extends readonly (
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>
  )[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C>,
  never,
  ScopeOfSelectStatement<C> &
    UnionToIntersection<ScopeOfSelectStatement<CS[number]>>,
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>
>;
```

**Example**

```ts
import { fromNothing, dsql as sql, union } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = union([q1, q2]);
assert.strictEqual(u.stringify(), "SELECT 123 AS `a` UNION SELECT 456 AS `a`");
```

Added in v2.0.0

## unionAll

Creates a compound query using 'UNION ALL'

**Signature**

```ts
export declare const unionAll: <
  C extends
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>,
  CS extends readonly (
    | SelectStatement<any, any, any, any>
    | AliasedSelectStatement<any, any, any, any>
  )[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C>,
  never,
  ScopeOfSelectStatement<C> &
    UnionToIntersection<ScopeOfSelectStatement<CS[number]>>,
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>
>;
```

**Example**

```ts
import { fromNothing, dsql as sql, unionAll } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = unionAll([q1, q2]);
assert.strictEqual(
  u.stringify(),
  "SELECT 123 AS `a` UNION ALL SELECT 456 AS `a`"
);
```

Added in v2.0.0

# starter

## fromNothing

Select data from no source.

**Signature**

```ts
export declare const fromNothing: <NewSelection extends string = never>(
  it: Record<NewSelection, SafeString>
) => SelectStatement<NewSelection, never, Record<string, never>, never>;
```

**Example**

```ts
import { fromNothing, dsql as sql } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
assert.strictEqual(q1.stringify(), "SELECT 123 AS `a`");
```

Added in v2.0.0

## fromStringifiedSelectStatement

Create a select statement from a raw string.

**Signature**

```ts
export declare const fromStringifiedSelectStatement: <
  NewSelection extends string = never
>(
  content: SafeString
) => StringifiedSelectStatement<NewSelection, never, never, never>;
```

**Example**

```ts
import { fromStringifiedSelectStatement, castSafe } from "sql-select-ts";
const s1 = fromStringifiedSelectStatement(castSafe("SELECT * FROM `users`"));
assert.strictEqual(
  s1.selectStar().stringify(),
  "SELECT * FROM (SELECT * FROM `users`)"
);
```

Added in v2.0.0

## select

Creates a query selecting from the second parameter.

**Signature**

```ts
export declare const select: <
  FromSelection extends string = never,
  FromAlias extends string = never,
  FromScope extends ScopeShape = never,
  FromFlatScope extends string = never,
  NewSelection extends string = never,
  SubSelection extends FromSelection = never
>(
  _:
    | readonly SubSelection[]
    | ((
        fields: Record<FromSelection, SafeString> &
          SelectionOfScope<FromScope> &
          NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>),
  from: TableOrSubquery<FromSelection, FromAlias, FromScope, FromFlatScope>
) => SelectStatement<
  NewSelection | SubSelection,
  never,
  FromScope,
  FromFlatScope
>;
```

Added in v2.0.0

## selectStar

Creates a query selecting all from the second parameter.

**Signature**

```ts
export declare const selectStar: <
  FromSelection extends string = never,
  FromAlias extends string = never,
  FromScope extends ScopeShape = never,
  FromFlatScope extends string = never
>(
  from: TableOrSubquery<FromSelection, FromAlias, FromScope, FromFlatScope>
) => SelectStatement<FromSelection, never, never, FromSelection>;
```

Added in v2.0.0

## table

Create a table definition. Optionally, you can provide an alias for the table, which can differ from it's name.

**Signature**

```ts
export declare const table: <Selection extends string, Alias extends string>(
  columns: readonly Selection[],
  alias: Alias,
  name?: string
) => Table<Selection, Alias, { [key in Alias]: Selection }, Selection>;
```

**Example**

```ts
import { table } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
assert.strictEqual(t1.selectStar().stringify(), "SELECT * FROM `users`");

const t2 = table(["id", "name"], "alias", "users");
assert.strictEqual(
  t2.selectStar().stringify(),
  "SELECT * FROM `users` AS `alias`"
);
```

Added in v2.0.0

## withR

Create a common table expression, renaming the selection.

**Signature**

```ts
export declare const withR: <NSelection extends string, NAlias extends string>(
  select: AliasedSelectStatement<any, NAlias, any, any>,
  columns: readonly NSelection[]
) => CommonTableExpressionFactory<
  NSelection,
  NAlias,
  { [key in NAlias]: NSelection },
  NSelection
>;
```

Added in v2.0.0

## with\_

Create a common table expression.

**Signature**

```ts
export declare const with_: <NSelection extends string, NAlias extends string>(
  select: AliasedSelectStatement<NSelection, NAlias, any, any>
) => CommonTableExpressionFactory<
  NSelection,
  NAlias,
  { [key in NAlias]: NSelection },
  NSelection
>;
```

Added in v2.0.0

# string-builder

## SafeString

A wrapper over a string, We assume that strings inside the wrapper are safe to write as plain SQL.

**Signature**

```ts
export declare const SafeString: SafeString;
```

Added in v2.0.0

## buildSerializer

**Signature**

```ts
export declare const buildSerializer: <T>(args: {
  check: (it: unknown) => it is T;
  serialize: (it: T) => string;
}) => Serializer<T>;
```

Added in v2.0.0

## buildSql

**Signature**

```ts
export declare const buildSql: <T extends Serializer<any>[]>(
  serializers: T
) => SqlStringBuilder<T>;
```

Added in v2.0.0

## castSafe

Creates a SafeString from a string.

Useful for embedding other SQL statements in your SQL query, or building helper functions.

**Signature**

```ts
export declare const castSafe: (content: string) => SafeString;
```

**Example**

```ts
import { castSafe, dsql as sql } from "sql-select-ts";

assert.strictEqual(castSafe(";'abc'").content, ";'abc'");
assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
```

Added in v2.0.0

## dsql

Safe-string builder. Works as a function or string template literal.

Check in depth docs in the safe-string.ts module.

**Signature**

```ts
export declare const dsql: SqlStringBuilder<never[]>;
```

**Example**

```ts
import { fromNothing, dsql as sql } from "sql-select-ts";
assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
assert.strictEqual(sql(123).content, "123");
assert.strictEqual(sql(null).content, "NULL");
assert.strictEqual(sql`${123} + 456`.content, "123 + 456");
const name = "A";
const names = ["A", "B", "C"];
assert.strictEqual(
  sql`${name} IN (${names})`.content,
  "'A' IN ('A', 'B', 'C')"
);
const q = fromNothing({ it: sql(123) });
assert.strictEqual(sql`${name} IN ${q}`.content, "'A' IN (SELECT 123 AS `it`)");
```

Added in v2.0.0

## isSafeString

Type guard to check if the value is a SafeString.

**Signature**

```ts
export declare const isSafeString: (it: any) => it is SafeString;
```

**Example**

```ts
import { isSafeString, dsql as sql } from "sql-select-ts";

assert.strictEqual(isSafeString(sql(123)), true);
```

Added in v2.0.0

# utils

## AnyPrintable

**Signature**

```ts
export declare const AnyPrintable: AnyPrintable;
```

Added in v2.0.0

## RowOf

Return a objects, where the keys are the columns of the selection.

**Signature**

```ts
export declare const RowOf: {
  [K in SelectionOf<T>]: string | number | null | undefined;
};
```

**Example**

```ts
import { table, RowOf } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
const q = t1.selectStar();
type Ret = RowOf<typeof q>;
const ret: Ret = { id: 1, name: null };
console.log(ret.id);
console.log(ret.name);
//@ts-expect-error
console.log(ret.abc);
```

Added in v2.0.0

## RowsArray

Return an array of objects, where the object keys are the columns of the selection.

**Signature**

```ts
export declare const RowsArray: RowsArray<T>;
```

**Example**

```ts
import { table, RowsArray } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
const q = t1.selectStar();
type Ret = RowsArray<typeof q>;
const ret: Ret = [];
console.log(ret?.[0]?.id);
console.log(ret?.[0]?.name);
//@ts-expect-error
console.log(ret?.[0]?.abc);
```

Added in v2.0.0

## SelectionOf

Given a printable object, returns the union of the selection keys.

**Signature**

```ts
export declare const SelectionOf: SelectionOf<T>;
```

**Example**

```ts
import { table, SelectionOf } from "sql-select-ts";
const t1 = table(["id", "name"], "users");
const q = t1.selectStar();
type Key = SelectionOf<typeof q>;
const k: Key = "id";
assert.strictEqual(k, "id");
//@ts-expect-error
const k2: Key = "abc";
```

Added in v2.0.0
