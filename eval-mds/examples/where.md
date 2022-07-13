```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Where", 15);
```

```ts eval
import { table, dsql as sql, SafeString, castSafe } from "../../src";
```

We will use this table

```sql
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts eval
const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);
```

# One Clause

```ts eval --out=sql
const name = "Lucas";
users
    .selectStar()
    .where((f) => sql`${f.name} = ${name}`)
    .stringify();
```

# Two Clauses

## One call

```ts eval --out=sql
const name2 = "Lucas";
users
    .selectStar()
    .where((f) => [sql`${f.name} = ${name2}`, sql`${f.id} = 5`])
    .stringify();
```

## Two calls

```ts eval --out=sql
const id = 5;
users
    .selectStar()
    .where((f) => sql`${f.name} = 'Lucas'`)
    .where((f) => sql`${f.id} = ${id}`)
    .stringify();
```

# OR

```ts eval --out=sql
const OR = (...cases: SafeString[]): SafeString => {
    const j = cases.map((it) => it.content).join(" OR ");
    return castSafe(`(${j})`);
};
users
    .selectStar()
    .where((f) => OR(sql`${f.name} = 'Lucas'`, sql`${f.id} = ${id}`))
    .stringify();
```
