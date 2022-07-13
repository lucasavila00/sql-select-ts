```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Group by", 10);
```

```ts eval
import { table, dsql as sql, SafeString } from "../../src";
```

We will use this table

```sql
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts eval
const users = table(["id", "age", "name"], "users");

const lowercase = (it: SafeString): SafeString => sql`lowerCase(${it})`;
```

# One Clause

```ts eval --out=sql
users
    .selectStar()
    .groupBy((f) => lowercase(f.name))
    .stringify();
```

```ts eval --out=sql
users.selectStar().groupBy(["name"]).stringify();
```

# Two Clauses

## One call

```ts eval --out=sql
users
    .selectStar()
    .groupBy((f) => [f.name, f.id])
    .stringify();
```

```ts eval --out=sql
users.selectStar().groupBy(["name", "id"]).stringify();
```

## Two calls

```ts eval --out=sql
users
    .selectStar()
    .groupBy((f) => f.name)
    .groupBy((f) => f.id)
    .stringify();
```

```ts eval --out=sql
users.selectStar().groupBy(["name"]).groupBy(["id"]).stringify();
```
