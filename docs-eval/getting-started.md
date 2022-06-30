---
title: Getting Started
nav_order: 0
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

# Getting started

Import the table constructor

```ts eval --replacePrintedInput=../src,sql-select-ts
import { table, sql, SafeString } from "../src";
```

Construct a table instance

```ts eval
const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);
```

Create a query

```ts eval
const q = users.selectStar();
```

Get the SQL

```ts eval --yield=sql
const str = q.stringify();
yield str;
```

## String interpolation

```ts eval
const q2 = users
    .select((fields) => ({ age: fields.age }))
    .where((fields) => sql`${fields.id}=1`);
```

```ts eval --yield=sql
yield q2.stringify();
```

## String interpolation helpers

```ts eval --yield=sql
const eq = (
    a: SafeString | string | number,
    b: SafeString | string | number
): SafeString => sql`${a}=${b}`;

const MAX = (it: SafeString): SafeString => sql`MAX(${it})`;

const q3 = users
    .select((fields) => ({ age: MAX(fields.age) }))
    .where((fields) => eq(fields.id, 1));

yield q3.stringify();
```

## Composition

```ts eval --yield=sql
yield q
    .commaJoinSelect(
        /*left alias*/ "q",
        /*right alias*/ "q3",
        /*right select*/ q3
    )
    .selectStar()
    .stringify();
```
