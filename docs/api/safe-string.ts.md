---
title: safe-string.ts
nav_order: 8
parent: Api
layout: default
---

## safe-string overview

Safe String and it's building mechanisms allows us to have painless, injection safe SQL string building.

Added in v0.0.0

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# string-builder

## buildSerializer

Create one serializer.

**Signature**

```ts
export declare const buildSerializer: <T>(args: {
  check: (it: unknown) => it is T;
  serialize: (it: T) => string;
}) => Serializer<T>;
```

Added in v0.0.1

## buildSql

Create a custom version of the `sql` SafeString builder, using the serializers to serialize values.
The types allowed in the string templates will be inferred from the serializers.

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
import { castSafe, dsql as sql } from "sql-select-ts";

assert.strictEqual(castSafe(";'abc'").content, ";'abc'");
assert.strictEqual(sql(";'abc'").content, "';\\'abc\\''");
```

Added in v0.0.0

## dsql

Safe-string builder. Works as a function or string template literal.

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

Added in v1.0.0

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

## Serializer (type alias)

A custom serializer for the SQL string builder.

**Signature**

```ts
export type Serializer<T> = {
  check: (it: unknown) => it is T;
  serialize: (it: T) => string;
};
```

Added in v0.0.1

## SqlStringBuilder (type alias)

A `sql` builder type based on the serializer types.

**Signature**

```ts
export type SqlStringBuilder<T extends Serializer<any>[]> =
  SqlStringBuilderOverloadedFn<ArgsOfSerializerList<T>>;
```

Added in v0.0.1

## SqlStringBuilderOverloadedFn (interface)

A `sql` builder generic overloaded function.

**Signature**

```ts
export interface SqlStringBuilderOverloadedFn<T> {
  (it: string | number | null | T): SafeString;
  (
    template: ReadonlyArray<string>,
    ...args: (SqlSupportedTypes | T | readonly (SqlSupportedTypes | T)[])[]
  ): SafeString;
}
```

Added in v0.0.1
