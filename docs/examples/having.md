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
const t0 = table(["x", "y"], "t0");
```

# One Clause

```ts
t0.selectStar()
  .groupBy((f) => f.x)
  .having((f) => f.x)
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
t0.select((f) => ({ it: f.x }))
  .groupBy((f) => f.y)
  .having((f) => f.y)
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
  .groupBy((f) => f.x)
  .having((f) => f.x)
  .groupBy((f) => f.y)
  .having((f) => f.y)
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
  .groupBy(["x"])
  .having(["x"])
  .groupBy(["y"])
  .having(["y"])
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
  .groupBy((f) => [f.x, f.y])
  .having((f) => [f.x, f.y])
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
t0.selectStar().groupBy(["x", "y"]).having(["x", "y"]).stringify();
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
