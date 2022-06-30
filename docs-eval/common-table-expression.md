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

```ts eval --replacePrintedInput=../src,sql-select-ts
import { table, sql, with_ } from "../src";
```

```ts eval
const t0 = table(["x", "y"], "t0");
```

# Specifying columns

```ts eval --yield=sql
yield with_(
    //
    t0.selectStar(),
    "x",
    ["a", "b"]
)
    .select((_f) => ({ it: sql(10) }))
    .stringify();
```

# No columns specified

```ts eval --yield=sql
const q0 = with_(
    //
    t0.selectStar(),
    "x"
).select((_f) => ({ it: sql(10) }));

yield q0.stringify();
```

# Compose

```ts eval --yield=sql
yield q0.commaJoinTable("q0", t0).selectStar().stringify();
```
