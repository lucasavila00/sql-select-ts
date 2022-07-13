---
title: Clickhouse Extensions
nav_order: 70
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
  dsql as sql,
  fromStringifiedSelectStatement,
} from "sql-select-ts";
```

# Final Table

```ts
const chTableRegular = table(
  /* columns: */ ["col1", "col2"],
  /* alias: */ "tableName"
);
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

```ts
table(
  /* columns: */ ["col1", "col2"],
  /* alias: */ "alias",
  /* name: */ "tableName"
)
  .clickhouse.final()
  .selectStar()
  .stringify();
```

```sql
SELECT
  *
FROM
  `tableName` AS `alias` FINAL
```

# Prewhere

The API is like WHERE's.

```ts
chTableFinal
  .selectStar()
  .where(/* f: */ (f) => f.col2)
  .clickhouse.prewhere(/* f: */ (f) => f.col1)
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
  .clickhouse.prewhere(/* f: */ (f) => f.col1)
  .clickhouse.prewhere(/* f: */ (f) => f.col2)
  .where(/* f: */ (f) => f.col2)
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
  .clickhouse.replace(/* f: */ (f) => [["col1", sql`${f.col1}+1`]])
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
  .select(/* f: */ (f) => ({ res1: f.col1 }))
  .clickhouse.with_(
    /* it: */ {
      abc: chTableFinal.select(/* f: */ (_f) => ({ count: sql`COUNT()` })),
    }
  )
  .appendSelect(/* f: */ (f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
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

```ts
chTableRegular
  .select(/* f: */ (f) => ({ res1: f.col1 }))
  .clickhouse.with_(
    /* it: */ { abc: fromStringifiedSelectStatement(/* content: */ sql`20`) }
  )
  .appendSelect(/* f: */ (f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
  .stringify();
```

```sql
WITH
  (20) AS `abc`
SELECT
  `col1` AS `res1`,
  `col2` + `abc` AS `res2`
FROM
  `tableName`
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)