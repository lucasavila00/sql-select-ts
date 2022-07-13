---
title: Join
nav_order: 8
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
import {
  table,
  SafeString,
  dsql as sql,
  unionAll,
  fromStringifiedSelectStatement,
  castSafe,
} from "sql-select-ts";
```

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
CREATE TABLE analytics(id int, clicks int);
```

Which are defined in typescript as

```ts
const users = table(/* columns: */ ["id", "age", "name"], /* alias: */ "users");
const admins = table(
  /* columns: */ ["id", "age", "name"],
  /* alias: */ "adm",
  /* name: */ "admins"
);
const analytics = table(
  /* columns: */ ["id", "clicks"],
  /* alias: */ "analytics"
);
```

We also need a helper function that constructs SafeStrings

```ts
const equals = (
  a: SafeString | number | string,
  b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;
```

# ON

## Join Table

```ts
users
  .joinTable(/* operator: */ "LEFT", /* table: */ admins)
  .on(/* on: */ (f) => equals(/* a: */ f["adm.id"], /* b: */ f["users.id"]))
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
  LEFT JOIN `admins` AS `adm` ON `adm`.`id` = `users`.`id`
```

## Join Select

```ts
admins
  .joinSelect(
    /* selectAlias: */ "u",
    /* operator: */ "LEFT",
    /* select: */ users.selectStar()
  )
  .on(/* on: */ (f) => equals(/* a: */ f["u.id"], /* b: */ f["adm.id"]))
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
  LEFT JOIN (
    SELECT
      *
    FROM
      `users`
  ) AS `u` ON `u`.`id` = `adm`.`id`
```

## Join Stringified Select

```ts
const aQueryThatIsAString = users.selectStar().stringify();
const usersStringifiedQuery = fromStringifiedSelectStatement<
  "id" | "age" | "name"
>(/* content: */ castSafe(/* content: */ aQueryThatIsAString));
admins
  .joinStringifiedSelect(
    /* selectAlias: */ "u",
    /* operator: */ "LEFT",
    /* select: */ usersStringifiedQuery
  )
  .on(/* on: */ (f) => equals(/* a: */ f["u.id"], /* b: */ f["adm.id"]))
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
  LEFT JOIN (
    SELECT
      *
    FROM
      `users`
  ) AS `u` ON `u`.`id` = `adm`.`id`
```

## Join Compound

```ts
admins
  .joinCompound(
    /* compoundAlias: */ "u",
    /* operator: */ "LEFT",
    /* compound: */ unionAll(
      /* content: */ [
        users.selectStar().where(/* f: */ (f) => sql`${f.id} = 1`),
        users.selectStar().where(/* f: */ (f) => sql`${f.id} = 2`),
      ]
    )
  )
  .on(/* on: */ (f) => equals(/* a: */ f["u.id"], /* b: */ f["adm.id"]))
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
  LEFT JOIN (
    SELECT
      *
    FROM
      `users`
    WHERE
      `id` = 1
    UNION ALL
    SELECT
      *
    FROM
      `users`
    WHERE
      `id` = 2
  ) AS `u` ON `u`.`id` = `adm`.`id`
```

## Join 3 Tables

```ts
users
  .joinTable(/* operator: */ "LEFT", /* table: */ admins)
  .on(/* on: */ (f) => equals(/* a: */ f["adm.id"], /* b: */ f["users.id"]))
  .joinTable(/* operator: */ "LEFT", /* table: */ analytics)
  .on(
    /* on: */ (f) => equals(/* a: */ f["analytics.id"], /* b: */ f["users.id"])
  )
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
  LEFT JOIN `admins` AS `adm` ON `adm`.`id` = `users`.`id`
  LEFT JOIN `analytics` ON `analytics`.`id` = `users`.`id`
```

## Join 3 Selects

```ts
const userAndAdmin = users
  .selectStar()
  .joinSelect(
    /* thisSelectAlias: */ "users",
    /* operator: */ "LEFT",
    /* selectAlias: */ "admins",
    /* select: */ admins.selectStar()
  )
  .on(/* on: */ (f) => equals(/* a: */ f["admins.id"], /* b: */ f["users.id"]));
const userAdminAnalytics = userAndAdmin
  .joinSelect(
    /* operator: */ "LEFT",
    /* alias: */ "analytics",
    /* table: */ analytics.selectStar()
  )
  .on(
    /* on: */ (f) => equals(/* a: */ f["analytics.id"], /* b: */ f["users.id"])
  );
userAdminAnalytics.selectStar().stringify();
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
  ) AS `users`
  LEFT JOIN (
    SELECT
      *
    FROM
      `admins` AS `adm`
  ) AS `admins` ON `admins`.`id` = `users`.`id`
  LEFT JOIN (
    SELECT
      *
    FROM
      `analytics`
  ) AS `analytics` ON `analytics`.`id` = `users`.`id`
```

# USING

## Join Table

```ts
users
  .joinTable(/* operator: */ "LEFT", /* table: */ admins)
  .using(/* keys: */ ["id"])
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
  LEFT JOIN `admins` AS `adm` USING (`id`)
```

## Join Select

```ts
admins
  .joinSelect(
    /* selectAlias: */ "u",
    /* operator: */ "LEFT",
    /* select: */ users.selectStar()
  )
  .using(/* keys: */ ["id"])
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
  LEFT JOIN (
    SELECT
      *
    FROM
      `users`
  ) AS `u` USING (`id`)
```

# No Constraint

## Join Table

```ts
users
  .joinTable(/* operator: */ "NATURAL", /* table: */ admins)
  .noConstraint()
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`
  NATURAL JOIN `admins` AS `adm`
```

## Join Select

```ts
admins
  .joinSelect(
    /* selectAlias: */ "u",
    /* operator: */ "NATURAL",
    /* select: */ users.selectStar()
  )
  .noConstraint()
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`
  NATURAL JOIN (
    SELECT
      *
    FROM
      `users`
  ) AS `u`
```

# Comma Join

## Join Table

```ts
users.commaJoinTable(/* table: */ admins).selectStar().stringify();
```

```sql
SELECT
  *
FROM
  `users`,
  `admins` AS `adm`
```

## Join Select

```ts
admins
  .commaJoinSelect(/* selectAlias: */ "u", /* select: */ users.selectStar())
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`,
  (
    SELECT
      *
    FROM
      `users`
  ) AS `u`
```

## Join Compound

```ts
admins
  .commaJoinCompound(
    /* compoundAlias: */ "u",
    /* compound: */ unionAll(
      /* content: */ [
        users.selectStar().where(/* f: */ (f) => sql`${f.id} = 1`),
        users.selectStar().where(/* f: */ (f) => sql`${f.id} = 2`),
      ]
    )
  )
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `admins` AS `adm`,
  (
    SELECT
      *
    FROM
      `users`
    WHERE
      `id` = 1
    UNION ALL
    SELECT
      *
    FROM
      `users`
    WHERE
      `id` = 2
  ) AS `u`
```

## Join 3 Tables

```ts
users
  .commaJoinTable(/* table: */ admins)
  .commaJoinTable(/* table: */ analytics)
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `users`,
  `admins` AS `adm`,
  `analytics`
```

## Join 3 Selects

```ts
const userAndAdmin2 = users
  .selectStar()
  .commaJoinSelect(
    /* thisSelectAlias: */ "users",
    /* selectAlias: */ "admins",
    /* select: */ admins.selectStar()
  );
const userAdminAnalytics2 = userAndAdmin2.commaJoinSelect(
  /* alias: */ "analyitcs",
  /* select: */ analytics.selectStar()
);
userAdminAnalytics2.selectStar().stringify();
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
  ) AS `users`,
  (
    SELECT
      *
    FROM
      `admins` AS `adm`
  ) AS `admins`,
  (
    SELECT
      *
    FROM
      `analytics`
  ) AS `analyitcs`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)