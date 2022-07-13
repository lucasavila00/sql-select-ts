```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Limit", 9);
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

# Limiting to a number

```ts eval --out=sql
users.selectStar().limit(5).stringify();
```

# Limiting with offset

```ts eval --out=sql
users
    .selectStar()
    .limit(sql`1 OFFSET 10`)
    .stringify();
```
