---
title: Group by
nav_order: 10
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
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts eval
const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);
```

# One Clause

```ts eval --yield=sql
yield users
    .selectStar()
    .groupBy((f) => f.age)
    .stringify();
```

# Two Clauses

## One call

```ts eval --yield=sql
yield users
    .selectStar()
    .groupBy((f) => [f.age, f.id])
    .stringify();
```

## Two calls

```ts eval --yield=sql
yield users
    .selectStar()
    .groupBy((f) => f.age)
    .groupBy((f) => f.id)
    .stringify();
```
