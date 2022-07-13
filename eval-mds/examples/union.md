```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Union (Compound)", 25);
```

```ts eval
import { table, union, unionAll, except, intersect } from "../../src";
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
const users = table(["id", "age", "name"], "users");

const admins = table(["id", "age", "name"], "adm", "admins");
```

# Supported types

## Union

```ts eval --out=sql
union([admins.selectStar(), users.selectStar()]).stringify();
```

## Union All

```ts eval --out=sql
unionAll([admins.selectStar(), users.selectStar()]).stringify();
```

## Except

```ts eval --out=sql
except([admins.selectStar(), users.selectStar()]).stringify();
```

## Intersect

```ts eval --out=sql
intersect([admins.selectStar(), users.selectStar()]).stringify();
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

```ts eval --out=sql
const array2 = pipe(
    [admins.selectStar(), users.selectStar()],
    RNEA.map((it) => it.selectStar())
);

intersect(array2).stringify();
```
