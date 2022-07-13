```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Select", 7);
```

```ts eval
import {
    fromNothing,
    dsql as sql,
    table,
    unionAll,
    fromStringifiedSelectStatement,
    selectStar,
    select,
    SafeString,
} from "../../src";
```

# From Raw String (Stringified Select Statement)

```ts eval --out=sql
const q = fromStringifiedSelectStatement<"a">(sql`SELECT 1 AS a`);

q.selectStar()
    .orderBy((f) => f.a)
    .stringify();
```

# From Nothing

## Select

```ts eval --out=sql
fromNothing({
    abc: sql`123 + 456`,
}).stringify();
```

## Append Select

```ts eval --out=sql
fromNothing({
    abc: sql(123),
})
    .appendSelect((f) => ({
        def: sql`${f.abc} + 456`,
    }))
    .stringify();
```

## Select from Select

```ts eval
const initialData = fromNothing({
    it: sql(0),
});
```

Starting at query top

```ts eval --out=sql
selectStar(
    select(["it"], initialData).where((f) => sql`${f.it} = 1`)
).stringify();
```

Starting at query root

```ts eval --out=sql
initialData
    .select(["it"])
    .where((f) => sql`${f.it} = 1`)
    .selectStar()
    .stringify();
```

# From Tables

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
```

Which are defined in typescript as

```ts eval
const users = table(["id", "age", "name", "country"], "users");

const admins = table(["id", "age", "name", "country"], "adm", "admins");
```

And a helper function

```ts eval
const MAX = (it: SafeString): SafeString => sql`MAX(${it})`;
```

## Select star

```ts eval --out=sql
users.selectStar().stringify();
```

## Select a field

From top

```ts eval --out=sql
select(
    //
    (f) => ({ maxAge: MAX(f.age) }),
    users
).stringify();
```

From root

```ts eval --out=sql
users.select((f) => ({ maxAge: MAX(f.age) })).stringify();
```

## Select distinct

```ts eval --out=sql
admins.select(["name"]).distinct().stringify();
```

## Select star and a field

```ts eval --out=sql
users
    .selectStar()
    .appendSelect((f) => ({
        otherAlias: f.name,
    }))
    .stringify();
```

## Select a field and star

```ts eval --out=sql
admins
    .select((f) => ({
        otherAlias: f["adm.name"],
    }))
    .appendSelectStar()
    .stringify();
```

## Select star of aliases

```ts eval --out=sql
admins.commaJoinTable(users).selectStarOfAliases(["users"]).stringify();
```

## Select from sub-select

```ts eval --out=sql
users.selectStar().select(["age"]).selectStar().stringify();
```

## Select from union

```ts eval --out=sql
unionAll([users.selectStar(), admins.selectStar()]).select(["age"]).stringify();
```

## Select from join

```ts eval --out=sql
users
    .joinTable("LEFT", admins)
    .using(["id"])
    .select(["users.name", "adm.name"])
    .stringify();
```

# Don't select the fields object directly

This is not valid. The typescript compiler will prevent this.

```ts eval --out=hide
users
    // @ts-expect-error
    .select((f) => f);
```

# Control order of selection

Although it works on most cases, order of selection is not guaranteed.

```ts eval --out=sql
users
    .select((f) => ({
        abc: f.name,
        def: f.id,
    }))
    .stringify();
```

```ts eval --out=sql
users
    .select((f) => ({
        ["123"]: f.age,
        name: f.name,
        ["456"]: f.id,
    }))
    .stringify();
```

To achieve control of the selection order, append each item individually.

```ts eval --out=sql
users
    .select((f) => ({
        ["123"]: f.age,
    }))
    .appendSelect(["name"])
    .appendSelect((f) => ({
        ["456"]: f.id,
    }))
    .stringify();
```
