---
title: Group by
nav_order: 10
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
import { table } from "sql-select-ts";
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
users
  .selectStar()
  .groupBy((f) => f.age)
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `age`
```

# Two Clauses

## One call

```ts
users
  .selectStar()
  .groupBy((f) => [f.age, f.id])
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `age`,
  `id`
```

## Two calls

```ts
users
  .selectStar()
  .groupBy((f) => f.age)
  .groupBy((f) => f.id)
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `age`,
  `id`
```
