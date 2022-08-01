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

```ts
import {
    fromNothing,
    dsql as sql,
    table,
    unionAll,
    fromStringifiedSelectStatement,
    selectStar,
    select,
    SafeString,
} from "../../src";
```

# From Raw String (Stringified Select Statement)

```ts
const q = fromStringifiedSelectStatement<"a">(sql`SELECT 1 AS a`);

q.selectStar()
    .orderBy((f) => f.a)
    .stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      1 AS a
  )
ORDER BY
  `a`
```

# From Nothing

## Select

```ts
fromNothing({
    abc: sql`123 + 456`,
}).stringify();
```

```sql
SELECT
  123 + 456 AS `abc`
```

## Append Select

```ts
fromNothing({
    abc: sql(123),
})
    .appendSelect((f) => ({
        def: sql`${f.abc} + 456`,
    }))
    .stringify();
```

```sql
SELECT
  123 AS `abc`,
  `abc` + 456 AS `def`
```

## Select from Select

```ts
const initialData = fromNothing({
    it: sql(0),
});
```

Starting at query top

```ts
selectStar(
    select(["it"], initialData).where((f) => sql`${f.it} = 1`)
).stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      `it` AS `it`
    FROM
      (
        SELECT
          0 AS `it`
      )
    WHERE
      `it` = 1
  )
```

Starting at query root

```ts
initialData
    .select(["it"])
    .where((f) => sql`${f.it} = 1`)
    .selectStar()
    .stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      `it` AS `it`
    FROM
      (
        SELECT
          0 AS `it`
      )
    WHERE
      `it` = 1
  )
```

# From Tables

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
```

Which are defined in typescript as

```ts
const users = table(["id", "age", "name", "country"], "users");

const admins = table(["id", "age", "name", "country"], "adm", "admins");
```

And a helper function

```ts
const MAX = (it: SafeString): SafeString => sql`MAX(${it})`;
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

From top

```ts
select(
    //
    (f) => ({ maxAge: MAX(f.age) }),
    users
).stringify();
```

```sql
SELECT
  MAX(`age`) AS `maxAge`
FROM
  `users`
```

From root

```ts
users.select((f) => ({ maxAge: MAX(f.age) })).stringify();
```

```sql
SELECT
  MAX(`age`) AS `maxAge`
FROM
  `users`
```

## Select distinct

```ts
admins.select(["name"]).distinct().stringify();
```

```sql
SELECT
  DISTINCT `name` AS `name`
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
  `name` AS `otherAlias`
FROM
  `users`
```

## Select a field and star

```ts
admins
    .select((f) => ({
        otherAlias: f.adm.name,
    }))
    .appendSelectStar()
    .stringify();
```

```sql
SELECT
  `adm`.`name` AS `otherAlias`,
  *
FROM
  `admins` AS `adm`
```

## Select star of aliases

```ts
admins.commaJoin(users).selectStarOfAliases(["users"]).stringify();
```

```sql
SELECT
  users.*
FROM
  `admins` AS `adm`,
  `users`
```

## Select from sub-select

```ts
users.selectStar().select(["age"]).selectStar().stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      `age` AS `age`
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
unionAll([users.selectStar(), admins.selectStar()]).select(["age"]).stringify();
```

```sql
SELECT
  `age` AS `age`
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
    .join("LEFT", admins)
    .using(["id"])
    .select((f) => ({ "users.name": f.users.name, "adm.name": f.adm.name }))
    .stringify();
```

```sql
SELECT
  `users`.`name` AS `users.name`,
  `adm`.`name` AS `adm.name`
FROM
  `users`
  LEFT JOIN `admins` AS `adm` USING (`id`)
```

# Don't select the fields object directly

This is not valid. The typescript compiler will prevent this.

```ts
users
    // @ts-expect-error
    .select((f) => f);
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
  `name` AS `abc`,
  `id` AS `def`
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
  `age` AS `123`,
  `id` AS `456`,
  `name` AS `name`
FROM
  `users`
```

To achieve control of the selection order, append each item individually.

```ts
users
    .select((f) => ({
        ["123"]: f.age,
    }))
    .appendSelect((f) => ({ name: f.name }))
    .appendSelect((f) => ({
        ["456"]: f.id,
    }))
    .stringify();
```

```sql
SELECT
  `age` AS `123`,
  `name` AS `name`,
  `id` AS `456`
FROM
  `users`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)