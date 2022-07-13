---
title: Getting Started
nav_order: 0
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

# Getting started

```ts
import { table, dsql as sql, SafeString } from "sql-select-ts";
```

Construct a table instance

```ts
const users = table(/* columns: */ ["id", "age", "name"], /* alias: */ "users");
```

Create a query

```ts
const q = users.selectStar();
```

Get the SQL

```ts
const str = q.stringify();
str;
```

```sql
SELECT
  *
FROM
  `users`
```

## String interpolation

```ts
const q2 = users
  .select(/* f: */ ["age"])
  .where(/* f: */ (fields) => sql`${fields.id}=1`);
```

```ts
q2.stringify();
```

```sql
SELECT
  `age` AS `age`
FROM
  `users`
WHERE
  `id` = 1
```

## String interpolation helpers

```ts
const eq = (
  a: SafeString | string | number,
  b: SafeString | string | number
): SafeString => sql`${a}=${b}`;
const MAX = (it: SafeString): SafeString => sql`MAX(${it})`;
const q3 = users
  .select(/* f: */ (fields) => ({ age: MAX(/* it: */ fields.age) }))
  .where(/* f: */ (fields) => eq(/* a: */ fields.id, /* b: */ 1));
q3.stringify();
```

```sql
SELECT
  MAX(`age`) AS `age`
FROM
  `users`
WHERE
  `id` = 1
```

## Composition

```ts
q.commaJoinSelect(
  /* thisSelectAlias: */ "q",
  /* selectAlias: */ "q3",
  /* select: */ q3
)
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      *
    FROM
      `users`
  ) AS `q`,
  (
    SELECT
      MAX(`age`) AS `age`
    FROM
      `users`
    WHERE
      `id` = 1
  ) AS `q3`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)