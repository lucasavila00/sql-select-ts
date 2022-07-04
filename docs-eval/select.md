---
title: Select
nav_order: 7
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
import {
    fromNothing,
    dsql as sql,
    table,
    unionAll,
    fromStringifiedSelectStatement,
    selectStar,
    select,
    SafeString,
} from "../src";
```

# From Raw String (Stringified Select Statement)

```ts eval --yield=sql
const q = fromStringifiedSelectStatement<"a">(sql`SELECT 1 AS a`);

yield q
    .selectStar()
    .orderBy((f) => f.a)
    .stringify();
```

# From Nothing

## Select

```ts eval --yield=sql
yield fromNothing({
    abc: sql`123 + 456`,
}).stringify();
```

## Append Select

```ts eval --yield=sql
yield fromNothing({
    abc: sql(123),
})
    .appendSelect((f) => ({
        def: sql`${f.abc} + 456`,
    }))
    .stringify();
```

## Select from Select

```ts eval
const initialData = fromNothing({
    it: sql(0),
});
```

Starting at query top

```ts eval --yield=sql
yield selectStar(
    select(
        (f) => ({ it2: f.it }),
        //
        initialData
    ).where((f) => sql`${f.it2} = 1`)
).stringify();
```

Starting at query root

```ts eval --yield=sql
yield initialData
    .select((f) => ({ it2: f.it }))
    .where((f) => sql`${f.it2} = 1`)
    .selectStar()
    .stringify();
```

# From Tables

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
```

Which are defined in typescript as

```ts eval
const users = table(
    /* columns: */ ["id", "age", "name", "country"],
    /* db-name & alias: */ "users"
);

const admins = table(
    /* columns: */ ["id", "age", "name", "country"],
    /* alias: */ "adm",
    /* db-name: */ "admins"
);
```

And a helper function

```ts eval
const MAX = (it: SafeString): SafeString => sql`MAX(${it})`;
```

## Select star

```ts eval --yield=sql
yield users.selectStar().stringify();
```

## Select a field

From top

```ts eval --yield=sql
yield select(
    //
    (f) => ({ maxAge: MAX(f.age) }),
    users
).stringify();
```

From root

```ts eval --yield=sql
yield users.select((f) => ({ maxAge: MAX(f.age) })).stringify();
```

## Select distinct

```ts eval --yield=sql
yield admins
    .select((f) => ({ name: f.name }))
    .distinct()
    .stringify();
```

## Select star and a field

```ts eval --yield=sql
yield users
    .selectStar()
    .appendSelect((f) => ({
        otherAlias: f.name,
    }))
    .stringify();
```

## Select a field and star

```ts eval --yield=sql
yield admins
    .select((f) => ({
        otherAlias: f["adm.name"],
    }))
    .appendSelectStar()
    .stringify();
```

## Select from sub-select

```ts eval --yield=sql
yield users
    .selectStar()
    .select((f) => ({ age: f.age }))
    .selectStar()
    .stringify();
```

## Select from union

```ts eval --yield=sql
yield unionAll([users.selectStar(), admins.selectStar()])
    .select((f) => ({ age: f.age }))
    .stringify();
```

## Select from join

```ts eval --yield=sql
yield users
    .joinTable("LEFT", admins)
    .using(["id"])
    .select((f) => ({
        userName: f["users.name"],
        admName: f["adm.name"],
    }))
    .stringify();
```

# Don't select the fields object directly

This is not valid. The typescript compiler will prevent this.

```ts eval
users
    // @ts-expect-error
    .select((f) => f);
```

# Control order of selection

Although it works on most cases, order of selection is not guaranteed.

```ts eval --yield=sql
yield users
    .select((f) => ({
        abc: f.name,
        def: f.id,
    }))
    .stringify();
```

```ts eval --yield=sql
yield users
    .select((f) => ({
        ["123"]: f.age,
        name: f.name,
        ["456"]: f.id,
    }))
    .stringify();
```

To achieve control of the selection order, append each item individually.

```ts eval --yield=sql
yield users
    .select((f) => ({
        ["123"]: f.age,
    }))
    .appendSelect((f) => ({
        name: f.name,
    }))
    .appendSelect((f) => ({
        ["456"]: f.id,
    }))
    .stringify();
```
