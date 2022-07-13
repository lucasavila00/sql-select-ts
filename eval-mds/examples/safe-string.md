```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Safe String", 6);
```

```ts eval
import {
    fromNothing,
    dsql as sql,
    unionAll,
    SafeString,
    castSafe,
    buildSerializer,
    buildSql,
} from "../../src";
```

# sql - As Function

```ts eval --out=sql
fromNothing({
    string: sql("abc"),
    number: sql(123),
    null: sql(null),
}).stringify();
```

# sql - As String Template Literal

## String Literal

```ts eval --out=sql
fromNothing({
    it: sql`system.tables`,
}).stringify();
```

## String Interpolation

```ts eval --out=sql
const name = "Lucas";
fromNothing({
    it: sql`'a' = ${name}`,
}).stringify();
```

## Number Interpolation

```ts eval --out=sql
const n = 456;
fromNothing({
    it: sql`123 = ${n}`,
}).stringify();
```

## Array Interpolation

```ts eval --out=sql
const nums = [1, 2, 3];

fromNothing({
    it: sql`1 IN (${nums})`,
}).stringify();
```

## Select Interpolation

```ts eval --out=sql
const q0 = fromNothing({
    it: sql`123 = 456`,
});
fromNothing({
    isIn: sql`something IN ${q0}`,
}).stringify();
```

## Compound Interpolation

```ts eval --out=sql
const q1 = fromNothing({
    it: sql`123 = 456`,
});
const q2 = fromNothing({
    it: sql`1 > 0`,
});
const u = unionAll([q1, q2]);
fromNothing({
    isIn: sql`something IN ${u}`,
}).stringify();
```

## Composition

```ts eval --out=sql
const square = (it: SafeString): SafeString => sql`((${it}) * (${it}))`;

const four = square(sql(2));

fromNothing({
    four,
    it: square(square(square(sql`system.tables + ${four}`))),
}).stringify();
```

# Convert Raw String to Safe String

```ts eval --out=sql
const str = `aFunction(123)`;
const filter = castSafe(str);
fromNothing({ it: filter }).stringify();
```

```ts eval --out=sql
const str2 = `aFunction(123)`;
const filter2 = sql`${str2}`;
fromNothing({ it: filter2 }).stringify();
```

# Accessing string content

```ts eval --out=sql
const b = "b";
const it = sql`a = ${b}`;
it.content;
```

# Common used helpers

## Equals

```ts eval --=json
const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

equals(1, 2);
```

## OR

```ts eval --=json
const OR = (...cases: SafeString[]): SafeString => {
    const j = cases.map((it) => it.content).join(" OR ");
    return castSafe(`(${j})`);
};
OR(equals(1, 2), equals(3, 4), equals("a", "b"));
```

# Extending

```ts eval
const boolSerializer = buildSerializer({
    check: (it: unknown): it is boolean => typeof it == "boolean",
    serialize: (it: boolean): string => (it ? "1" : "0"),
});

const sql2 = buildSql([boolSerializer]);
```

```ts eval --=json
sql2(true);
```

```ts eval --=json
sql2(false);
```

```ts eval --=json
sql2`${true} == ${false} == ${123} == ${"abc"}`;
```
