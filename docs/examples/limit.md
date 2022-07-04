---
title: Limit
nav_order: 9
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
import { table, dsql as sql } from "sql-select-ts";
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

# Limiting to a number

```ts
users.selectStar().limit(5).stringify();
```

```sql
SELECT
  *
FROM
  `users`
LIMIT
  5
```

# Limiting with offset

```ts
users
  .selectStar()
  .limit(sql`1 OFFSET 10`)
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
LIMIT
  1
OFFSET
  10
```
