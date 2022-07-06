---
title: Where
nav_order: 15
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
import { table, dsql as sql, SafeString, castSafe } from "../src";
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
const name = "Lucas";
yield users
    .selectStar()
    .where((f) => sql`${f.name} = ${name}`)
    .stringify();
```

# Two Clauses

## One call

```ts eval --yield=sql
const name2 = "Lucas";
yield users
    .selectStar()
    .where((f) => [sql`${f.name} = ${name2}`, sql`${f.id} = 5`])
    .stringify();
```

## Two calls

```ts eval --yield=sql
const id = 5;
yield users
    .selectStar()
    .where((f) => sql`${f.name} = 'Lucas'`)
    .where((f) => sql`${f.id} = ${id}`)
    .stringify();
```

# OR

```ts eval --yield=sql
const OR = (...cases: SafeString[]): SafeString => {
    const j = cases.map((it) => it.content).join(" OR ");
    return castSafe(`(${j})`);
};
yield users
    .selectStar()
    .where((f) => OR(sql`${f.name} = 'Lucas'`, sql`${f.id} = ${id}`))
    .stringify();
```
