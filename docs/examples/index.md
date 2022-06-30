---
title: Examples
has_children: true
permalink: /docs/examples
nav_order: 2
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

Import the table constructor

```ts
import { table, sql, SafeString } from "../src";
```

Construct a table instance

```ts
const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);
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
  .select((fields) => ({ age: fields.age }))
  .where((fields) => sql`${fields.id}=1`);
```

```ts
q2.stringify();
```

```sql
SELECT
  age AS `age`
FROM
  `users`
WHERE
  id = 1
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
  MAX(age) AS `age`
FROM
  `users`
WHERE
  id = 1
```

## Composition

```ts
q.commaJoinSelect(/*left alias*/ "q", /*right alias*/ "q3", /*right select*/ q3)
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
      MAX(age) AS `age`
    FROM
      `users`
    WHERE
      id = 1
  ) AS `q3`
```
