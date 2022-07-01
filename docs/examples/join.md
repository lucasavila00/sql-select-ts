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
  sql,
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
const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);

const admins = table(
  /* columns: */ ["id", "age", "name"],
  /* alias: */ "adm",
  /* db-name: */ "admins"
);

const analytics = table(
  /* columns: */ ["id", "clicks"],
  /* db-name & alias: */ "analytics"
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
  .joinTable("LEFT", admins)
  .on((f) => equals(f["adm.id"], f["users.id"]))
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
  .joinSelect("u", "LEFT", users.selectStar())
  .on((f) => equals(f["u.id"], f["adm.id"]))
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
>(castSafe(aQueryThatIsAString));

admins
  .joinStringifiedSelect("u", "LEFT", usersStringifiedQuery)
  .on((f) => equals(f["u.id"], f["adm.id"]))
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
    "u",
    "LEFT",
    unionAll([
      users.selectStar().where((f) => sql`${f.id} = 1`),
      users.selectStar().where((f) => sql`${f.id} = 2`),
    ])
  )
  .on((f) => equals(f["u.id"], f["adm.id"]))
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
  .joinTable("LEFT", admins)
  .on((f) => equals(f["adm.id"], f["users.id"]))
  .joinTable("LEFT", analytics)
  .on((f) => equals(f["analytics.id"], f["users.id"]))
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
  .joinSelect("users", "LEFT", "admins", admins.selectStar())
  .on((f) => equals(f["admins.id"], f["users.id"]));

const userAdminAnalytics = userAndAdmin
  .joinSelect("LEFT", "analytics", analytics.selectStar())
  .on((f) => equals(f["analytics.id"], f["users.id"]));

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
users.joinTable("LEFT", admins).using(["id"]).selectStar().stringify();
```

```sql
SELECT
  *
FROM
  `users`
  LEFT JOIN `admins` AS `adm` USING(`id`)
```

## Join Select

```ts
admins
  .joinSelect("u", "LEFT", users.selectStar())
  .using(["id"])
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
  ) AS `u` USING(`id`)
```

# No Constraint

## Join Table

```ts
users.joinTable("NATURAL", admins).noConstraint().selectStar().stringify();
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
  .joinSelect("u", "NATURAL", users.selectStar())
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
users.commaJoinTable(admins).selectStar().stringify();
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
admins.commaJoinSelect("u", users.selectStar()).selectStar().stringify();
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
    "u",
    unionAll([
      users.selectStar().where((f) => sql`${f.id} = 1`),
      users.selectStar().where((f) => sql`${f.id} = 2`),
    ])
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
users.commaJoinTable(admins).commaJoinTable(analytics).selectStar().stringify();
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
  .commaJoinSelect("users", "admins", admins.selectStar());

const userAdminAnalytics2 = userAndAdmin2.commaJoinSelect(
  "analyitcs",
  analytics.selectStar()
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
