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
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { pipe } from "fp-ts/lib/function";
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

# Supported types

## Union

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

## Union All

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

## Except

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

## Intersect

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

# Note on arrays

Arrays passed to compound operators must be non empty, such that the type system can tell the type of the first item.

As shown above, an array literal works fine, but a mapped array needs special care.

[fp-ts](https://gcanti.github.io/fp-ts/modules/ReadonlyNonEmptyArray.ts.html) can be used to work with such ReadOnlyNonEmptyArrays.

```ts
interface ReadOnlyNonEmptyArray<A> extends ReadonlyArray<A> {
  0: A;
}
```

```ts
const array2 = pipe(
  [admins.selectStar(), users.selectStar()],
  RNEA.map((it) => it.selectStar())
);

intersect(array2).stringify();
```

```sql
SELECT
  *
FROM
  (
    SELECT
      *
    FROM
      `admins` AS `adm`
  )
INTERSECT
SELECT
  *
FROM
  (
    SELECT
      *
    FROM
      `users`
  )
```
