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

```ts eval --replacePrintedInput=../src,sql-select-ts
import { table, dsql as sql, fromStringifiedSelectStatement } from "../src";
```

# Final Table

```ts eval --yield=sql
const chTableRegular = table(["col1", "col2"], "tableName");
yield chTableRegular.selectStar().stringify();
```

```ts eval --yield=sql
const chTableFinal = chTableRegular.clickhouse.final();
yield chTableFinal.selectStar().stringify();
```

```ts eval --yield=sql
yield table(["col1", "col2"], "alias", "tableName")
    .clickhouse.final()
    .selectStar()
    .stringify();
```

# Prewhere

The API is like WHERE's.

```ts eval --yield=sql
yield chTableFinal
    .selectStar()
    .where((f) => f.col2)
    .clickhouse.prewhere((f) => f.col1)
    .stringify();
```

```ts eval --yield=sql
yield chTableFinal
    .selectStar()
    .clickhouse.prewhere((f) => f.col1)
    .clickhouse.prewhere((f) => f.col2)
    .where((f) => f.col2)
    .stringify();
```

# Replace

```ts eval --yield=sql
yield chTableRegular
    .selectStar()
    .clickhouse.replace((f) => [["col1", sql`${f.col1}+1`]])
    .stringify();
```

# With (Non CTE)

Alongside Common Table Expressions, Clickhouse's syntax extension of WITH is also supported.

```ts eval --yield=sql
yield chTableRegular
    .select((f) => ({
        res1: f.col1,
    }))
    .clickhouse.with_({
        abc: chTableFinal.select((_f) => ({ count: sql`COUNT()` })),
    })
    .appendSelect((f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
    .stringify();
```

```ts eval --yield=sql
yield chTableRegular
    .select((f) => ({
        res1: f.col1,
    }))
    .clickhouse.with_({
        abc: fromStringifiedSelectStatement(sql`20`),
    })
    .appendSelect((f) => ({ res2: sql`${f.col2} + ${f.abc}` }))
    .stringify();
```
