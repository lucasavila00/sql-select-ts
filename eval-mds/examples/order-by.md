```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Order by", 10);
```

```ts eval
import { table, dsql as sql } from "../../src";
```

We will use this table

```sql
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts eval
const users = table(["id", "age", "name"], "users");
```

# One Clause

```ts eval --out=sql
users
    .selectStar()
    .orderBy((f) => f.age)
    .stringify();
```

# Two Clauses

## One call

```ts eval --out=sql
users
    .selectStar()
    .orderBy((f) => [sql`${f.age} DESC`, f.id])
    .stringify();
```

## Two calls

```ts eval --out=sql
users
    .selectStar()
    .orderBy((f) => f.age)
    .orderBy((f) => f.id)
    .stringify();
```

```ts eval --out=sql
users.selectStar().orderBy(["age", "id"]).stringify();
```
