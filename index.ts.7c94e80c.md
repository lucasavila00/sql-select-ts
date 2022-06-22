---
title: index.ts
nav_order: 6
parent: Modules
---

## index overview

Entry points of the library.

Added in v0.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [compound](#compound)
  - [union](#union)
  - [unionAll](#unionall)
- [starter](#starter)
  - [fromNothing](#fromnothing)
  - [table](#table)
  - [with\_](#with_)
- [string-builder](#string-builder)
  - [SafeString](#safestring)
  - [castSafe](#castsafe)
  - [isSafeString](#issafestring)
  - [sql](#sql)

---

# compound

## union

Creates a compound query using 'UNION'

**Signature**

```ts
export declare const union: <C extends SelectStatement<any, any>, CS extends SelectStatement<any, any>[]>(
  content: [C, ...CS]
) => Compound<
  | (C extends SelectStatement<infer _Scope, infer Selection> ? Selection : never)
  | (CS[number] extends SelectStatement<infer _Scope, infer Selection> ? Selection : never),
  C extends SelectStatement<infer _Scope, infer Selection> ? Selection : never
>
```

**Example**

```ts
import { fromNothing, sql, union } from 'sql-select-ts'
const q1 = fromNothing({ a: sql(123) })
const q2 = fromNothing({ a: sql(456) })

const u = union([q1, q2])
assert.strictEqual(u.print(), 'SELECT 123 AS a UNION SELECT 456 AS a')
```

Added in v0.0.0

## unionAll

Creates a compound query using 'UNION ALL'

**Signature**

```ts
export declare const unionAll: <C extends SelectStatement<any, any>, CS extends SelectStatement<any, any>[]>(
  content: [C, ...CS]
) => Compound<
  | (C extends SelectStatement<infer _Scope, infer Selection> ? Selection : never)
  | (CS[number] extends SelectStatement<infer _Scope, infer Selection> ? Selection : never),
  C extends SelectStatement<infer _Scope, infer Selection> ? Selection : never
>
```

**Example**

```ts
import { fromNothing, sql, unionAll } from 'sql-select-ts'
const q1 = fromNothing({ a: sql(123) })
const q2 = fromNothing({ a: sql(456) })

const u = unionAll([q1, q2])
assert.strictEqual(u.print(), 'SELECT 123 AS a UNION ALL SELECT 456 AS a')
```

Added in v0.0.0

# starter

## fromNothing

Select data from no source.

**Signature**

```ts
export declare const fromNothing: <NewSelection extends string>(
  it: Record<NewSelection, SafeString>
) => SelectStatement<never, NewSelection>
```

**Example**

```ts
import { fromNothing, sql } from 'sql-select-ts'
const q1 = fromNothing({ a: sql(123) })
assert.strictEqual(q1.print(), 'SELECT 123 AS a')
```

Added in v0.0.0

## table

Create a table definition. Optinionally, you can provide an alias for the table, which can differ from it's name.

**Signature**

```ts
export declare const table: <Selection extends string, Alias extends string>(
  columns: Selection[],
  alias: Alias,
  name?: string
) => Table<Selection, Alias>
```

**Example**

```ts
import { table } from 'sql-select-ts'
const t1 = table(['id', 'name'], 'users')
assert.strictEqual(t1.selectStar().print(), 'SELECT * FROM users')

const t2 = table(['id', 'name'], 'alias', 'users')
assert.strictEqual(t2.selectStar().print(), 'SELECT * FROM users AS alias')
```

Added in v0.0.0

## with\_

**Signature**

```ts
export declare const with_: <Selection extends string, Alias extends string>(
  select: SelectStatement<any, any>,
  alias: Alias,
  columns?: Selection[]
) => CommonTableExpression<Selection, Alias>
```

Added in v0.0.0

# string-builder

## SafeString

A wrapper over a string, We assume that strings inside the wrapper are safe to write as plain SQL.

**Signature**

```ts
export declare const SafeString: SafeString
```

Added in v0.0.0

## castSafe

Creates a SafeString from a string.

Useful for embedding other SQL statements in your SQL query, or building helper functions.

**Signature**

```ts
export declare const castSafe: (content: string) => SafeString
```

**Example**

```ts
import { castSafe, sql } from 'sql-select-ts'

assert.strictEqual(castSafe(";'abc'").content, ";'abc'")
assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''")
```

Added in v0.0.0

## isSafeString

Type guard to check if the value is a SafeString.

**Signature**

```ts
export declare const isSafeString: (it: any) => it is SafeString
```

**Example**

```ts
import { isSafeString, sql } from 'sql-select-ts'

assert.strictEqual(isSafeString(sql(123)), true)
```

Added in v0.0.0

## sql

Safe-string builder. Works as a function or string template literal.

Check in depth docs in the safe-string.ts module.

**Signature**

```ts
export declare const sql: typeof _sql
```

**Example**

```ts
import { fromNothing, sql } from 'sql-select-ts'
assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''")
assert.strictEqual(sql(123).content, '123')
assert.strictEqual(sql(null).content, 'NULL')
assert.strictEqual(sql`${123} + 456`.content, '123 + 456')
const name = 'A'
const names = ['A', 'B', 'C']
assert.strictEqual(sql`${name} IN (${names})`.content, "'A' IN ('A', 'B', 'C')")
const q = fromNothing({ it: sql(123) })
assert.strictEqual(sql`${name} IN ${q}`.content, "'A' IN (SELECT 123 AS it)")
```

Added in v0.0.0
