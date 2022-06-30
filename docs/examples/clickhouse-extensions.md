---
title: Clickhouse Extensions
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

```ts
import { table, sql } from "sql-select-ts";
```

# Final Table

```ts
const chTableRegular = table(["col1", "col2"], "tableName");
chTableRegular.selectStar().stringify();
```

```sql
SELECT
  *
FROM
  `tableName`
```

```ts
const chTableFinal = chTableRegular.clickhouse.final();
chTableFinal.selectStar().stringify();
```

```sql
SELECT
  *
FROM
  `tableName` FINAL
```

# Prewhere

The API is like WHERE's.

```ts
chTableFinal
  .selectStar()
  .where((f) => f.col2)
  .clickhouse.prewhere((f) => f.col1)
  .stringify();
```

```sql
SELECT
  *
FROM
  `tableName` FINAL PREWHERE `col1`
WHERE
  `col2`
```

```ts
chTableFinal
  .selectStar()
  .clickhouse.prewhere((f) => f.col1)
  .clickhouse.prewhere((f) => f.col2)
  .where((f) => f.col2)
  .stringify();
```

```sql
SELECT
  *
FROM
  `tableName` FINAL PREWHERE `col1`
  AND `col2`
WHERE
  `col2`
```

# Replace

```ts
chTableRegular
  .selectStar()
  .clickhouse.replace((f) => [["col1", sql`${f.col1}+1`]])
  .stringify();
```

```sql
SELECT
  * REPLACE (`col1` + 1 AS `col1`)
FROM
  `tableName`
```

# With (Non CTE)

Alongside Common Table Expressions, Clickhouse's syntax extension of WITH is also supported.

```ts
chTableRegular
  .select((f) => ({
    res1: f.col1,
  }))
  .clickhouse.with_({
    abc: chTableFinal.select((_f) => ({ count: sql`COUNT()` })),
  })
  .appendSelect((f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
  .stringify();
```

```sql
WITH
  (
    SELECT
      COUNT() AS `count`
    FROM
      `tableName` FINAL
  ) AS `abc`
SELECT
  `col1` AS `res1`,
  `col2` + `abc` AS `res2`
FROM
  `tableName`
```
