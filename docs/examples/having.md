---
title: Having
nav_order: 20
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
CREATE TABLE t0(x INTEGER, y INTEGER)
```

Which is defined in typescript as

```ts
const t0 = table(/* columns: */ ["x", "y"], /* alias: */ "t0");
```

# One Clause

```ts
t0.selectStar()
  .groupBy(/* f: */ (f) => f.x)
  .having(/* f: */ (f) => f.x)
  .stringify();
```

```sql
SELECT
  *
FROM
  `t0`
GROUP BY
  `x`
HAVING
  `x`
```

## From Select

```ts
t0.select(/* f: */ (f) => ({ it: f.x }))
  .groupBy(/* f: */ (f) => f.y)
  .having(/* f: */ (f) => f.y)
  .stringify();
```

```sql
SELECT
  `x` AS `it`
FROM
  `t0`
GROUP BY
  `y`
HAVING
  `y`
```

# Two Clauses

## In two calls

```ts
t0.selectStar()
  .groupBy(/* f: */ (f) => f.x)
  .having(/* f: */ (f) => f.x)
  .groupBy(/* f: */ (f) => f.y)
  .having(/* f: */ (f) => f.y)
  .stringify();
```

```sql
SELECT
  *
FROM
  `t0`
GROUP BY
  `x`,
  `y`
HAVING
  `x`
  AND `y`
```

```ts
t0.selectStar()
  .groupBy(/* f: */ ["x"])
  .having(/* f: */ ["x"])
  .groupBy(/* f: */ ["y"])
  .having(/* f: */ ["y"])
  .stringify();
```

```sql
SELECT
  *
FROM
  `t0`
GROUP BY
  `x`,
  `y`
HAVING
  `x`
  AND `y`
```

## In one call

```ts
t0.selectStar()
  .groupBy(/* f: */ (f) => [f.x, f.y])
  .having(/* f: */ (f) => [f.x, f.y])
  .stringify();
```

```sql
SELECT
  *
FROM
  `t0`
GROUP BY
  `x`,
  `y`
HAVING
  `x`
  AND `y`
```

```ts
t0.selectStar()
  .groupBy(/* f: */ ["x", "y"])
  .having(/* f: */ ["x", "y"])
  .stringify();
```

```sql
SELECT
  *
FROM
  `t0`
GROUP BY
  `x`,
  `y`
HAVING
  `x`
  AND `y`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)