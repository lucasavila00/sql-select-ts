---
title: Where
nav_order: 15
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
import { table, sql } from "../src";
```

We will use this table

```sql
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts
const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);
```

# One Clause

```ts
const name = "Lucas";
users
  .selectStar()
  .where((f) => sql`${f.name} = ${name}`)
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
WHERE
  `name` = 'Lucas'
```

# Two Clauses

## One call

```ts
const name2 = "Lucas";
users
  .selectStar()
  .where((f) => [sql`${f.name} = ${name2}`, sql`${f.id} = 5`])
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
WHERE
  `name` = 'Lucas'
  AND `id` = 5
```

## Two calls

```ts
const id = 5;
users
  .selectStar()
  .where((f) => sql`${f.name} = 'Lucas'`)
  .where((f) => sql`${f.id} = ${id}`)
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
WHERE
  `name` = 'Lucas'
  AND `id` = 5
```
