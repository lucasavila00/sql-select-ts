---
title: safe-string.ts
nav_order: 7
parent: Api
layout: default
---

## safe-string overview

Safe String and it's building mechanisms allows us to have painless, injection safe SQL string building.

Added in v0.0.0

# string-builder

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

**Signature**

```ts
export declare function sql(it: string | number | null): SafeString;
export declare function sql(
  template: ReadonlyArray<string>,
  ...args: (SqlSupportedTypes | readonly SqlSupportedTypes[])[]
): SafeString;
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

## SafeString (type alias)

Type used to represent a string that is safe to use in a SQL query.

**Signature**

```ts
export type SafeString = {
  _tag: typeof SafeStringURI;
  content: string;
};
```

Added in v0.0.0

## SafeStringURI

Tag used to discriminate a SafeString object.

**Signature**

```ts
export declare const SafeStringURI: "SafeString";
```

Added in v0.0.0
