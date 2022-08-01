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
import { table, dsql as sql, SafeString } from "../../src";
```

Construct a table instance

```ts
const users = table(["id", "age", "name"], "users");
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
const q2 = users.select(["age"]).where((fields) => sql`${fields.id}=1`);
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
    .select((fields) => ({ age: MAX(fields.age) }))
    .where((fields) => eq(fields.id, 1));

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
q.as("q").commaJoin(q3.as("q3")).selectStar().stringify();
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