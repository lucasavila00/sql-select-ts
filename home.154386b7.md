A modern, database-agnostic, composable SELECT query builder with great typescript support.

# Install

Install from npm

```
npm i sql-select-ts
```

# Features

## Modern

Built with modern typescript and javascript features, it delivers a clean, easy-to-use and powerful API that couldn't exist before.

Such features include:

#### Safe string interpolation with template literals

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

#### Typescript template literal types

Provides type checking for identifiers names, with optional source qualifier, among other features.

```ts
const t1 = table(
  /* columns: */ ["a", "b", "c"],
  /* db-name & alias: */ "t1"
);
const t2 = table(
  /* columns: */ ["b", "c", "d"],
  /* db-name & alias: */ "t2"
);
t1.joinTable("NATURAL", t2)
  .using(["b"])
  .select((f) => ({
    // (parameter) f: Record<
    //   "a" | "d" | "t1.a" | "t1.b" | "t1.c" | "t2.b" | "t2.c" | "t2.d",
    // SafeString>
    z: f["t1.c"],
  }));
```

## Database agnostic

We focus on generating correct SQL syntax-wise, and let you take care of semantics.

This allows usage in any SQL database.

#### Usage with sqlite

TODO

#### Usage with Clickhouse

TODO

## Composable

TODO

## Typescript support

TODO

## Well tested

TODO

## Well documented

TODO

# Getting started

TODO
