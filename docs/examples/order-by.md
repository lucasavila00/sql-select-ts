---
title: Order by
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
import { table, dsql as sql } from "../../src";
```

We will use this table

```sql
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts
const users = table(["id", "age", "name"], "users");
```

# One Clause

```ts
users
    .selectStar()
    .orderBy((f) => f.age)
    .stringify();
```

```sql
SELECT
  *
FROM
  `users`
ORDER BY
  `age`
```

# Two Clauses

## One call

```ts
users
    .selectStar()
    .orderBy((f) => [sql`${f.age} DESC`, f.id])
    .stringify();
```

```sql
SELECT
  *
FROM
  `users`
ORDER BY
  `age` DESC,
  `id`
```

## Two calls

```ts
users
    .selectStar()
    .orderBy((f) => f.age)
    .orderBy((f) => f.id)
    .stringify();
```

```sql
SELECT
  *
FROM
  `users`
ORDER BY
  `age`,
  `id`
```

```ts
users.selectStar().orderBy(["age", "id"]).stringify();
```

```sql
SELECT
  *
FROM
  `users`
ORDER BY
  `age`,
  `id`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)