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
import { table, dsql as sql, SafeString } from "sql-select-ts";
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

const lowercase = (it: SafeString): SafeString => sql`lowerCase(${it})`;
```

# One Clause

```ts
users
  .selectStar()
  .groupBy((f) => lowercase(f.name))
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  lowerCase(`name`)
```

```ts
users.selectStar().groupBy(["name"]).stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `name`
```

# Two Clauses

## One call

```ts
users
  .selectStar()
  .groupBy((f) => [f.name, f.id])
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `name`,
  `id`
```

```ts
users.selectStar().groupBy(["name", "id"]).stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `name`,
  `id`
```

## Two calls

```ts
users
  .selectStar()
  .groupBy((f) => f.name)
  .groupBy((f) => f.id)
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `name`,
  `id`
```

```ts
users.selectStar().groupBy(["name"]).groupBy(["id"]).stringify();
```

```sql
SELECT
  *
FROM
  `users`
GROUP BY
  `name`,
  `id`
```
