---
title: Union (Compound)
nav_order: 25
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
import { table, union, unionAll, except, intersect } from "../src";
```

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
```

Which are defined in typescript as

```ts eval
const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);

const admins = table(
    /* columns: */ ["id", "age", "name"],
    /* alias: */ "adm",
    /* db-name: */ "admins"
);
```

# Union

```ts eval --yield=sql
yield union([admins.selectStar(), users.selectStar()]).stringify();
```

# Union All

```ts eval --yield=sql
yield unionAll([admins.selectStar(), users.selectStar()]).stringify();
```

# Except

```ts eval --yield=sql
yield except([admins.selectStar(), users.selectStar()]).stringify();
```

# Intersect

```ts eval --yield=sql
yield intersect([admins.selectStar(), users.selectStar()]).stringify();
```
