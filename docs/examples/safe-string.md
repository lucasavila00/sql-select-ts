---
title: Safe String
nav_order: 6
parent: Examples
layout: default
---

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

```ts
import {
    fromNothing,
    dsql as sql,
    unionAll,
    SafeString,
    castSafe,
    buildSerializer,
    buildSql,
} from "../../src";
```

# sql - As Function

```ts
fromNothing({
    string: sql("abc"),
    number: sql(123),
    null: sql(null),
}).stringify();
```

```sql
SELECT
  'abc' AS `string`,
  123 AS `number`,
  NULL AS `null`
```

# sql - As String Template Literal

## String Literal

```ts
fromNothing({
    it: sql`system.tables`,
}).stringify();
```

```sql
SELECT
  system.tables AS `it`
```

## String Interpolation

```ts
const name = "Lucas";
fromNothing({
    it: sql`'a' = ${name}`,
}).stringify();
```

```sql
SELECT
  'a' = 'Lucas' AS `it`
```

## Number Interpolation

```ts
const n = 456;
fromNothing({
    it: sql`123 = ${n}`,
}).stringify();
```

```sql
SELECT
  123 = 456 AS `it`
```

## Array Interpolation

```ts
const nums = [1, 2, 3];

fromNothing({
    it: sql`1 IN (${nums})`,
}).stringify();
```

```sql
SELECT
  1 IN (1, 2, 3) AS `it`
```

## Select Interpolation

```ts
const q0 = fromNothing({
    it: sql`123 = 456`,
});
fromNothing({
    isIn: sql`something IN ${q0}`,
}).stringify();
```

```sql
SELECT
  something IN (
    SELECT
      123 = 456 AS `it`
  ) AS `isIn`
```

## Compound Interpolation

```ts
const q1 = fromNothing({
    it: sql`123 = 456`,
});
const q2 = fromNothing({
    it: sql`1 > 0`,
});
const u = unionAll([q1, q2]);
fromNothing({
    isIn: sql`something IN ${u}`,
}).stringify();
```

```sql
SELECT
  something IN (
    SELECT
      123 = 456 AS `it`
    UNION ALL
    SELECT
      1 > 0 AS `it`
  ) AS `isIn`
```

## Composition

```ts
const square = (it: SafeString): SafeString => sql`((${it}) * (${it}))`;

const four = square(sql(2));

fromNothing({
    four,
    it: square(square(square(sql`system.tables + ${four}`))),
}).stringify();
```

```sql
SELECT
  ((2) * (2)) AS `four`,
  (
    (
      (
        (
          (
            (system.tables + ((2) * (2))) * (system.tables + ((2) * (2)))
          )
        ) * (
          (
            (system.tables + ((2) * (2))) * (system.tables + ((2) * (2)))
          )
        )
      )
    ) * (
      (
        (
          (
            (system.tables + ((2) * (2))) * (system.tables + ((2) * (2)))
          )
        ) * (
          (
            (system.tables + ((2) * (2))) * (system.tables + ((2) * (2)))
          )
        )
      )
    )
  ) AS `it`
```

# Convert Raw String to Safe String

```ts
const str = `aFunction(123)`;
const filter = castSafe(str);
fromNothing({ it: filter }).stringify();
```

```sql
SELECT
  aFunction(123) AS `it`
```

```ts
const str2 = `aFunction(123)`;
const filter2 = sql`${str2}`;
fromNothing({ it: filter2 }).stringify();
```

```sql
SELECT
  'aFunction(123)' AS `it`
```

# Accessing string content

```ts
const b = "b";
const it = sql`a = ${b}`;
it.content;
```

```sql
a = 'b'
```

# Common used helpers

## Equals

```ts
const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

equals(1, 2);
```

```json
{ "_tag": "SafeString", "content": "1 = 2" }
```

## OR

```ts
const OR = (...cases: SafeString[]): SafeString => {
    const j = cases.map((it) => it.content).join(" OR ");
    return castSafe(`(${j})`);
};
OR(equals(1, 2), equals(3, 4), equals("a", "b"));
```

```json
{ "_tag": "SafeString", "content": "(1 = 2 OR 3 = 4 OR 'a' = 'b')" }
```

# Extending

```ts
const boolSerializer = buildSerializer({
    check: (it: unknown): it is boolean => typeof it == "boolean",
    serialize: (it: boolean): string => (it ? "1" : "0"),
});

const sql2 = buildSql([boolSerializer]);
```

```ts
sql2(true);
```

```json
{ "_tag": "SafeString", "content": "1" }
```

```ts
sql2(false);
```

```json
{ "_tag": "SafeString", "content": "0" }
```

```ts
sql2`${true} == ${false} == ${123} == ${"abc"}`;
```

```json
{ "_tag": "SafeString", "content": "1 == 0 == 123 == 'abc'" }
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)