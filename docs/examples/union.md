---
title: Union (Compound)
nav_order: 25
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
import { table, union, unionAll, except, intersect } from "sql-select-ts";
```

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
```

Which are defined in typescript as

```ts
const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);

const admins = table(
  /* columns: */ ["id", "age", "name"],
  /* alias: */ "adm",
  /* db-name: */ "admins"
);
```

# Union

```ts
union([admins.selectStar(), users.selectStar()]).stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
UNION
SELECT
  *
FROM
  `users`
```

# Union All

```ts
unionAll([admins.selectStar(), users.selectStar()]).stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
UNION ALL
SELECT
  *
FROM
  `users`
```

# Except

```ts
except([admins.selectStar(), users.selectStar()]).stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
EXCEPT
SELECT
  *
FROM
  `users`
```

# Intersect

```ts
intersect([admins.selectStar(), users.selectStar()]).stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
INTERSECT
SELECT
  *
FROM
  `users`
```
