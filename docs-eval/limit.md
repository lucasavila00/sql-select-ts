---
title: Limit
nav_order: 9
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
import { table, sql } from "../src";
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

# Limiting to a number

```ts eval --yield=sql
yield users.selectStar().limit(5).stringify();
```

# Limiting with offset

```ts eval --yield=sql
yield users
    .selectStar()
    .limit(sql`1 OFFSET 10`)
    .stringify();
```
