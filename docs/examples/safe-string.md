# sql

## As Function

{% printer %}

```ts
fromNothing({
  string: sql("abc"),
  number: sql(123),
  null: sql(null),
}).print();
```

{% /printer %}

## As String Template Literal

## String Literal

{% printer %}

```ts
fromNothing({
  it: sql`system.tables`,
}).print();
```

{% /printer %}

## String Interpolation

{% printer %}

```ts
const name = "Lucas";
fromNothing({
  it: sql`'a' = ${name}`,
}).print();
```

{% /printer %}

## Number Interpolation

{% printer %}

```ts
const n = 456;
fromNothing({
  it: sql`123 = ${n}`,
}).print();
```

{% /printer %}

## Array Interpolation

{% printer %}

```ts
const nums = [1, 2, 3];

fromNothing({
  it: sql`1 IN (${nums})`,
}).print();
```

{% /printer %}

## Select Interpolation

{% printer %}

```ts
const q1 = fromNothing({
  it: sql`123 = 456`,
});
fromNothing({
  isIn: sql`something IN ${q1}`,
}).print();
```

{% /printer %}

## Compound Interpolation

{% printer %}

```ts
const q1 = fromNothing({
  it: sql`123 = 456`,
});
const q2 = fromNothing({
  it: sql`1 > 0`,
});
const u = unionAll([q1, q2]);
fromNothing({
  isIn: sql`something IN ${u}`,
}).print();
```

{% /printer %}

## Composition

{% printer %}

```ts
const square = (
  it: SafeString
): SafeString =>
  sql`((${it}) * (${it}))`;

const four = square(sql(2));

fromNothing({
  four,
  it: square(
    square(
      square(
        sql`system.tables + ${four}`
      )
    )
  ),
}).print();
```

{% /printer %}

# Convert Raw String to Safe String

{% printer %}

```ts
const str = `aFunction(123)`;
const filter = castSafe(str);
fromNothing({ it: filter }).print();
```

{% /printer %}

{% printer %}

```ts
const str = `aFunction(123)`;
const filter = sql`${str}`;
fromNothing({ it: filter }).print();
```

{% /printer %}

# Accessing string content

{% printer %}

```ts
const b = "b";
const it = sql`a = ${b}`;
it.content;
```

{% /printer %}

# Common used helpers

## Equals

```ts
const equals = (
  a: SafeString | number | string,
  b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

equals(1, 2).content;
```

```sql
1 = 2
```

## OR

{% printer %}

```ts
const OR = (
  ...cases: SafeString[]
): SafeString => {
  const j = cases
    .map((it) => it.content)
    .join(" OR ");
  return castSafe(`(${j})`);
};
OR(
  equals(1, 2),
  equals(3, 4),
  equals("a", "b")
).content;
```

{% /printer %}

# Extending

TODO
