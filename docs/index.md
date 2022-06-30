---
title: Home
nav_order: 1
layout: home
---

A modern, database-agnostic, composable SELECT query builder with great typescript support.

# Install

Install from npm

```
npm i sql-select-ts
```

# Getting started

Check out the [examples](/examples/getting-started).

# Features

## Safe string interpolation with template literals

```ts
const userInput = "SomeName";
const myString = sql`column = ${userInput}`;
// Prints:
// column = 'SomeName'

const userInput = 123;
const myString = sql`column = ${userInput}`;
// Prints:
// column = 123

const userInput = "';";
const myString = sql`column = ${userInput}`;
// Prints:
// column = '\';'
```

## Typescript checking

Provides type checking for identifiers names, with optional source qualifier, among other features.

```ts
const t1 = table(/* columns: */ ["a", "b", "c"], /* db-name & alias: */ "t1");
const t2 = table(/* columns: */ ["b", "c", "d"], /* db-name & alias: */ "t2");
t1.joinTable("NATURAL", t2)
    .using(["b"])
    .select((f) => ({
        // (parameter) f: Record<
        //   "a" | "d" | "t1.a" | "t1.b" | "t1.c" | "t2.b" | "t2.c" | "t2.d",
        // SafeString>
        z: f["t1.c"],
    }));
```

## Composable

```ts
const users = table(["id", "age", "name"], "users");
const admins = table(["id", "age", "name"], "adm", "admins");
const analytics = table(["id", "clicks"], "analytics");

users
    .joinTable("LEFT", admins)
    .on((f) => equals(f["adm.id"], f["users.id"]))
    .joinTable("LEFT", analytics)
    .on((f) => equals(f["analytics.id"], f["users.id"]))
    .selectStar()
    .stringify();
```

## Database agnostic

### Usage with sqlite

TODO

### Usage with Clickhouse

TODO
