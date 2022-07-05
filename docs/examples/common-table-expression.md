---
title: With
nav_order: 29
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

# With - Common Table Expressions

```ts
import { table, dsql as sql, with_ } from "sql-select-ts";
```

```ts
const t0 = table(["x", "y"], "t0");
```

# Specifying columns

```ts
with_(
  //
  t0.selectStar(),
  "x",
  ["a", "b"]
)
  .selectThis((_f) => ({ it: sql(10) }), "x")
  .stringify();
```

```sql
WITH
  x(a, b) AS (
    SELECT
      *
    FROM
      `t0`
  )
SELECT
  10 AS `it`
FROM
  `x`
```

# No columns specified

```ts
const q0 = with_(
  //
  t0.selectStar(),
  "x"
).selectThis((_f) => ({ it: sql(10) }), "x");

q0.stringify();
```

```sql
WITH
  x AS (
    SELECT
      *
    FROM
      `t0`
  )
SELECT
  10 AS `it`
FROM
  `x`
```

# Compose

```ts
q0.commaJoinTable("q0", t0).selectStar().stringify();
```

```sql
SELECT
  *
FROM
  (
    WITH
      x AS (
        SELECT
          *
        FROM
          `t0`
      )
    SELECT
      10 AS `it`
    FROM
      `x`
  ) AS `q0`,
  `t0`
```
