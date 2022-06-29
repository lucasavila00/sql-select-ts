---
title: Select
nav_order: 7
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

# From Nothing

```ts
import { fromNothing, sql, table, unionAll } from "../src";
```

## Select

```ts
fromNothing({
  it: sql`system.tables`,
  abc: sql`123 + 456`,
}).stringify();
```

```sql
SELECT
  system.tables AS `it`,
  123 + 456 AS `abc`
```

## Append Select

```ts
fromNothing({
  it: sql`system.tables`,
  abc: sql(123),
})
  .appendSelect((f) => ({
    def: sql`${f.abc} + 456`,
  }))
  .stringify();
```

```sql
SELECT
  system.tables AS `it`,
  123 AS `abc`,
  abc + 456 AS `def`
```

# From Tables

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

## Select star

```ts
users.selectStar().stringify();
```

```sql
SELECT
  *
FROM
  `users`
```

## Select a field

```ts
admins.select((f) => ({ name: f.name })).stringify();
```

```sql
SELECT
  name AS `name`
FROM
  `admins` AS `adm`
```

## Select distinct

```ts
admins
  .select((f) => ({ name: f.name }))
  .distinct()
  .stringify();
```

```sql
SELECT
  DISTINCT name AS `name`
FROM
  `admins` AS `adm`
```

## Select star and a field

```ts
users
  .selectStar()
  .appendSelect((f) => ({
    otherAlias: f.name,
  }))
  .stringify();
```

```sql
SELECT
  *,
  name AS `otherAlias`
FROM
  `users`
```

## Select a field and star

```ts
admins
  .select((f) => ({
    otherAlias: f["adm.name"],
  }))
  .appendSelectStar()
  .stringify();
```

```sql
SELECT
  adm.name AS `otherAlias`,
  *
FROM
  `admins` AS `adm`
```

## Select from sub-select

```ts
users
  .selectStar()
  .select((f) => ({ age: f.age }))
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      age AS `age`
    FROM
      (
        SELECT
          *
        FROM
          `users`
      )
  )
```

## Select from union

```ts
unionAll([users.selectStar(), admins.selectStar()])
  .select((f) => ({ age: f.age }))
  .stringify();
```

```sql
SELECT
  age AS `age`
FROM
  (
    SELECT
      *
    FROM
      `users`
    UNION ALL
    SELECT
      *
    FROM
      `admins` AS `adm`
  )
```

## Select from join

```ts
users
  .joinTable("LEFT", admins)
  .using(["id"])
  .select((f) => ({
    userName: f["users.name"],
    admName: f["adm.name"],
  }))
  .stringify();
```

```sql
SELECT
  users.name AS `userName`,
  adm.name AS `admName`
FROM
  `users`
  LEFT JOIN `admins` AS `adm` USING(`id`)
```

# Don't select the fields object directly

This is not valid. The typescript compiler will prevent this.

```ts
users
  // @ts-expect-error
  .select((f) => f);
```

# Alias of sub-selection

Sub selections that are not in a join context can be refered to by using `main_alias`.

```ts
users
  .selectStar()
  .where((f) => sql`${f.id} = 5`)
  .select((f) => ({ a: f["main_alias.id"] }))
  .stringify();
```

```sql
SELECT
  main_alias.id AS `a`
FROM
  (
    SELECT
      *
    FROM
      `users`
    WHERE
      id = 5
  ) AS main_alias
```

# Control order of selection

Although it works on most cases, order of selection is not guaranteed.

```ts
users
  .select((f) => ({
    abc: f.name,
    def: f.id,
  }))
  .stringify();
```

```sql
SELECT
  name AS `abc`,
  id AS `def`
FROM
  `users`
```

```ts
users
  .select((f) => ({
    ["123"]: f.age,
    name: f.name,
    ["456"]: f.id,
  }))
  .stringify();
```

```sql
SELECT
  age AS `123`,
  id AS `456`,
  name AS `name`
FROM
  `users`
```

To achieve control of the selection order, append each item individually.

```ts
users
  .select((f) => ({
    ["123"]: f.age,
  }))
  .appendSelect((f) => ({
    name: f.name,
  }))
  .appendSelect((f) => ({
    ["456"]: f.id,
  }))
  .stringify();
```

```sql
SELECT
  age AS `123`,
  name AS `name`,
  id AS `456`
FROM
  `users`
```
