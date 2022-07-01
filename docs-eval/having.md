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

```ts eval --replacePrintedInput=../src,sql-select-ts
import { table } from "../src";
```

We will use this table

```sql
CREATE TABLE t0(x INTEGER, y INTEGER)
```

Which is defined in typescript as

```ts eval
const t0 = table(["x", "y"], "t0");
```

# One Clause

```ts eval --yield=sql
yield t0
    .selectStar()
    .groupBy((f) => f.x)
    .having((f) => f.x)
    .stringify();
```

## From Select

```ts eval --yield=sql
yield t0
    .select((f) => ({ it: f.x }))
    .groupBy((f) => f.y)
    .having((f) => f.y)
    .stringify();
```

# Two Clauses

## In two calls

```ts eval --yield=sql
yield t0
    .selectStar()
    .groupBy((f) => f.x)
    .having((f) => f.x)
    .groupBy((f) => f.y)
    .having((f) => f.y)
    .stringify();
```

## In one call

```ts eval --yield=sql
yield t0
    .selectStar()
    .groupBy((f) => [f.x, f.y])
    .having((f) => [f.x, f.y])
    .stringify();
```
