---
title: Safe string
nav_order: 6
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

# sql - As Function

```ts eval
import { fromNothing, sql, unionAll, SafeString, castSafe } from "../src";
```

```ts eval --yield=sql
yield fromNothing({
    string: sql("abc"),
    number: sql(123),
    null: sql(null),
}).stringify();
```

# sql - As String Template Literal

## String Literal

```ts eval --yield=sql
yield fromNothing({
    it: sql`system.tables`,
}).stringify();
```

## String Interpolation

```ts eval --yield=sql
const name = "Lucas";
yield fromNothing({
    it: sql`'a' = ${name}`,
}).stringify();
```

## Number Interpolation

```ts eval --yield=sql
const n = 456;
yield fromNothing({
    it: sql`123 = ${n}`,
}).stringify();
```

## Array Interpolation

```ts eval --yield=sql
const nums = [1, 2, 3];

yield fromNothing({
    it: sql`1 IN (${nums})`,
}).stringify();
```

## Select Interpolation

```ts eval --yield=sql
const q0 = fromNothing({
    it: sql`123 = 456`,
});
yield fromNothing({
    isIn: sql`something IN ${q0}`,
}).stringify();
```

## Compound Interpolation

```ts eval --yield=sql
const q1 = fromNothing({
    it: sql`123 = 456`,
});
const q2 = fromNothing({
    it: sql`1 > 0`,
});
const u = unionAll([q1, q2]);
yield fromNothing({
    isIn: sql`something IN ${u}`,
}).stringify();
```

## Composition

```ts eval --yield=sql
const square = (it: SafeString): SafeString => sql`((${it}) * (${it}))`;

const four = square(sql(2));

yield fromNothing({
    four,
    it: square(square(square(sql`system.tables + ${four}`))),
}).stringify();
```

# Convert Raw String to Safe String

```ts eval --yield=sql
const str = `aFunction(123)`;
const filter = castSafe(str);
yield fromNothing({ it: filter }).stringify();
```

```ts eval --yield=sql
const str2 = `aFunction(123)`;
const filter2 = sql`${str2}`;
yield fromNothing({ it: filter2 }).stringify();
```

# Accessing string content

```ts eval --yield=sql
const b = "b";
const it = sql`a = ${b}`;
yield it.content;
```

# Common used helpers

## Equals

```ts eval --yield=json
const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

yield equals(1, 2);
```

## OR

```ts eval --yield=json
const OR = (...cases: SafeString[]): SafeString => {
    const j = cases.map((it) => it.content).join(" OR ");
    return castSafe(`(${j})`);
};
yield OR(equals(1, 2), equals(3, 4), equals("a", "b"));
```

# Extending

TODO
