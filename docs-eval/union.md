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
import * as RNEA from "fp-ts/lib/ReadonlyNonEmptyArray";
import { pipe } from "fp-ts/lib/function";
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

# Supported types

## Union

```ts eval --yield=sql
yield union([admins.selectStar(), users.selectStar()]).stringify();
```

## Union All

```ts eval --yield=sql
yield unionAll([admins.selectStar(), users.selectStar()]).stringify();
```

## Except

```ts eval --yield=sql
yield except([admins.selectStar(), users.selectStar()]).stringify();
```

## Intersect

```ts eval --yield=sql
yield intersect([admins.selectStar(), users.selectStar()]).stringify();
```

# Note on arrays

Arrays passed to compound operators must be non empty, such that the type system can tell the type of the first item.

As shown above, an array literal works fine, but a mapped array needs special care.

[fp-ts](https://gcanti.github.io/fp-ts/modules/ReadonlyNonEmptyArray.ts.html) can be used to work with such ReadOnlyNonEmptyArrays.

```ts
interface ReadOnlyNonEmptyArray<A> extends ReadonlyArray<A> {
    0: A;
}
```

```ts eval --yield=sql
const array2 = pipe(
    [admins.selectStar(), users.selectStar()],
    RNEA.map((it) => it.selectStar())
);

yield intersect(array2).stringify();
```
