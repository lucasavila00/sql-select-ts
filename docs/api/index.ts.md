---
title: index.ts
nav_order: 7
parent: Api
layout: default
---

## index overview

Entry points of the library.

Added in v0.0.0

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
  C extends SelectStatement<any, any>,
  CS extends SelectStatement<any, any>[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
  SelectionOfSelectStatement<C>
>;
```

**Example**

```ts
import { fromNothing, sql, except } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = except([q1, q2]);
assert.strictEqual(u.stringify(), "SELECT 123 AS `a` EXCEPT SELECT 456 AS `a`");
```

Added in v0.0.1

## intersect

Creates a compound query using 'INTERSECT'

**Signature**

```ts
export declare const intersect: <
  C extends SelectStatement<any, any>,
  CS extends SelectStatement<any, any>[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
  SelectionOfSelectStatement<C>
>;
```

**Example**

```ts
import { fromNothing, sql, intersect } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = intersect([q1, q2]);
assert.strictEqual(
  u.stringify(),
  "SELECT 123 AS `a` INTERSECT SELECT 456 AS `a`"
);
```

Added in v0.0.1

## union

Creates a compound query using 'UNION'

**Signature**

```ts
export declare const union: <
  C extends SelectStatement<any, any>,
  CS extends SelectStatement<any, any>[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
  SelectionOfSelectStatement<C>
>;
```

**Example**

```ts
import { fromNothing, sql, union } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = union([q1, q2]);
assert.strictEqual(u.stringify(), "SELECT 123 AS `a` UNION SELECT 456 AS `a`");
```

Added in v0.0.0

## unionAll

Creates a compound query using 'UNION ALL'

**Signature**

```ts
export declare const unionAll: <
  C extends SelectStatement<any, any>,
  CS extends SelectStatement<any, any>[]
>(
  content: CS & { 0: C }
) => Compound<
  SelectionOfSelectStatement<C> | SelectionOfSelectStatement<CS[number]>,
  SelectionOfSelectStatement<C>
>;
```

**Example**

```ts
import { fromNothing, sql, unionAll } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
const q2 = fromNothing({ a: sql(456) });

const u = unionAll([q1, q2]);
assert.strictEqual(
  u.stringify(),
  "SELECT 123 AS `a` UNION ALL SELECT 456 AS `a`"
);
```

Added in v0.0.0

# starter

## fromNothing

Select data from no source.

**Signature**

```ts
export declare const fromNothing: <NewSelection extends string>(
  it: Record<NewSelection, SafeString>
) => SelectStatement<never, NewSelection>;
```

**Example**

```ts
import { fromNothing, sql } from "sql-select-ts";
const q1 = fromNothing({ a: sql(123) });
assert.strictEqual(q1.stringify(), "SELECT 123 AS `a`");
```

Added in v0.0.0

## fromStringifiedSelectStatement

Create a select statement from a raw string.

**Signature**

```ts
export declare const fromStringifiedSelectStatement: <
  NewSelection extends string
>(
  content: SafeString
) => StringifiedSelectStatement<NewSelection>;
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

Added in v0.0.3

## select

Creates a query selecting from the second parameter.

**Signature**

```ts
export declare const select: <
  NewSelection extends string,
  FromAlias extends string,
  FromSelection extends string,
  FromScope extends string,
  FromAmbigous extends string
>(
  f: (
    f: Record<FromSelection, SafeString> & NoSelectFieldsCompileError
  ) => Record<NewSelection, SafeString>,
  from: TableOrSubquery<FromAlias, FromScope, FromSelection, FromAmbigous>
) => SelectStatement<FromSelection, NewSelection>;
```

Added in v1.0.0

## selectStar

Creates a query selecting all from the second parameter.

**Signature**

```ts
export declare const selectStar: <
  FromAlias extends string,
  FromSelection extends string,
  FromScope extends string,
  FromAmbigous extends string
>(
  from: TableOrSubquery<FromAlias, FromScope, FromSelection, FromAmbigous>
) => SelectStatement<FromSelection, FromSelection>;
```

Added in v1.0.0

## table

Create a table definition. Optinionally, you can provide an alias for the table, which can differ from it's name.

**Signature**

```ts
export declare const table: <Selection extends string, Alias extends string>(
  columns: readonly Selection[],
  alias: Alias,
  name?: string
) => Table<Selection, Alias>;
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

Added in v0.0.0

## with\_

Create a common table expression.

**Signature**

```ts
export declare const with_: <Selection extends string, Alias extends string>(
  select: SelectStatement<any, any>,
  alias: Alias,
  columns?: Selection[]
) => CommonTableExpression<`${Alias}.${Selection}`, Selection>;
```

Added in v0.0.0

# string-builder

## SafeString

A wrapper over a string, We assume that strings inside the wrapper are safe to write as plain SQL.

**Signature**

```ts
export declare const SafeString: SafeString;
```

Added in v0.0.0

## buildSerializer

**Signature**

```ts
export declare const buildSerializer: <T>(args: {
  check: (it: unknown) => it is T;
  serialize: (it: T) => string;
}) => Serializer<T>;
```

Added in v0.0.1

## buildSql

**Signature**

```ts
export declare const buildSql: <T extends Serializer<any>[]>(
  serializers: T
) => SqlStringBuilder<T>;
```

Added in v0.0.1

## castSafe

Creates a SafeString from a string.

Useful for embedding other SQL statements in your SQL query, or building helper functions.

**Signature**

```ts
export declare const castSafe: (content: string) => SafeString;
```

**Example**

```ts
import { castSafe, sql } from "sql-select-ts";

assert.strictEqual(castSafe(";'abc'").content, ";'abc'");
assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
```

Added in v0.0.0

## isSafeString

Type guard to check if the value is a SafeString.

**Signature**

```ts
export declare const isSafeString: (it: any) => it is SafeString;
```

**Example**

```ts
import { isSafeString, sql } from "sql-select-ts";

assert.strictEqual(isSafeString(sql(123)), true);
```

Added in v0.0.0

## sql

Safe-string builder. Works as a function or string template literal.

Check in depth docs in the safe-string.ts module.

**Signature**

```ts
export declare const sql: SqlStringBuilder<never[]>;
```

**Example**

```ts
import { fromNothing, sql } from "sql-select-ts";
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

Added in v0.0.0

# utils

## AnyStringifyable

**Signature**

```ts
export declare const AnyStringifyable: AnyStringifyable;
```

Added in v0.0.1

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

Added in v0.0.1

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

Added in v0.0.1

## SelectionOf

Given a stringifyable object, returns the union of the selection keys.

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

Added in v0.0.1
