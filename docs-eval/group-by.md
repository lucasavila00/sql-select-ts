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
import { table, dsql as sql, SafeString } from "../src";
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

const lowercase = (it: SafeString): SafeString => sql`lowerCase(${it})`;
```

# One Clause

```ts eval --yield=sql
yield users
    .selectStar()
    .groupBy((f) => lowercase(f.name))
    .stringify();
```

```ts eval --yield=sql
yield users.selectStar().groupBy(["name"]).stringify();
```

# Two Clauses

## One call

```ts eval --yield=sql
yield users
    .selectStar()
    .groupBy((f) => [f.name, f.id])
    .stringify();
```

```ts eval --yield=sql
yield users.selectStar().groupBy(["name", "id"]).stringify();
```

## Two calls

```ts eval --yield=sql
yield users
    .selectStar()
    .groupBy((f) => f.name)
    .groupBy((f) => f.id)
    .stringify();
```

```ts eval --yield=sql
yield users.selectStar().groupBy(["name"]).groupBy(["id"]).stringify();
```
