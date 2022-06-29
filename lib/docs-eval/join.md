```ts eval
import { table, SafeString, sql, unionAll } from "../src";
```

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
CREATE TABLE analytics(id int, clicks int);
```

Which are defined in typescript as

```ts eval
const users = table(
    /* columns: */ ["id", "age", "name"],
    /* db-name & alias: */ "users"
);

const admins = table(
    /* columns: */ ["id", "age", "name"],
    /* alias: */ "adm",
    /* db-name: */ "admins"
);

const analytics = table(
    /* columns: */ ["id", "clicks"],
    /* db-name & alias: */ "analytics"
);
```

We also need a helper function that constructs SafeStrings

```ts eval
const equals = (
    a: SafeString | number | string,
    b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;
```

# ON

## Join Table

```ts eval --yield=sql
yield users
    .joinTable("LEFT", admins)
    .on((f) => equals(f["adm.id"], f["users.id"]))
    .selectStar()
    .stringify();
```

## Join Select

```ts eval --yield=sql
yield admins
    .joinSelect("u", "LEFT", users.selectStar())
    .on((f) => equals(f["u.id"], f["adm.id"]))
    .selectStar()
    .stringify();
```

## Join Compound

```ts eval --yield=sql
yield admins
    .joinCompound(
        "u",
        "LEFT",
        unionAll([
            users.selectStar().where((f) => sql`${f.id} = 1`),
            users.selectStar().where((f) => sql`${f.id} = 2`),
        ])
    )
    .on((f) => equals(f["u.id"], f["adm.id"]))
    .selectStar()
    .stringify();
```

## Join 3 Tables

```ts eval --yield=sql
yield users
    .joinTable("LEFT", admins)
    .on((f) => equals(f["adm.id"], f["users.id"]))
    .joinTable("LEFT", analytics)
    .on((f) => equals(f["analytics.id"], f["users.id"]))
    .selectStar()
    .stringify();
```

## Join 3 Selects

```ts eval --yield=sql
const userAndAdmin = users
    .selectStar()
    .joinSelect("users", "LEFT", "admins", admins.selectStar())
    .on((f) => equals(f["admins.id"], f["users.id"]));

const userAdminAnalytics = userAndAdmin
    .joinSelect("LEFT", "analytics", analytics.selectStar())
    .on((f) => equals(f["analytics.id"], f["users.id"]));

yield userAdminAnalytics.selectStar().stringify();
```

# USING

## Join Table

```ts eval --yield=sql
yield users.joinTable("LEFT", admins).using(["id"]).selectStar().stringify();
```

## Join Select

```ts eval --yield=sql
yield admins
    .joinSelect("u", "LEFT", users.selectStar())
    .using(["id"])
    .selectStar()
    .stringify();
```

# No Constraint

## Join Table

```ts eval --yield=sql
yield users
    .joinTable("NATURAL", admins)
    .noConstraint()
    .selectStar()
    .stringify();
```

## Join Select

```ts eval --yield=sql
yield admins
    .joinSelect("u", "NATURAL", users.selectStar())
    .noConstraint()
    .selectStar()
    .stringify();
```

# Comma Join

## Join Table

```ts eval --yield=sql
yield users.commaJoinTable(admins).selectStar().stringify();
```

## Join Select

```ts eval --yield=sql
yield admins.commaJoinSelect("u", users.selectStar()).selectStar().stringify();
```

## Join Compound

```ts eval --yield=sql
yield admins
    .commaJoinCompound(
        "u",
        unionAll([
            users.selectStar().where((f) => sql`${f.id} = 1`),
            users.selectStar().where((f) => sql`${f.id} = 2`),
        ])
    )
    .selectStar()
    .stringify();
```

## Join 3 Tables

```ts eval --yield=sql
yield users
    .commaJoinTable(admins)
    .commaJoinTable(analytics)
    .selectStar()
    .stringify();
```

## Join 3 Selects

```ts eval --yield=sql
const userAndAdmin2 = users
    .selectStar()
    .commaJoinSelect("users", "admins", admins.selectStar());

const userAdminAnalytics2 = userAndAdmin2.commaJoinSelect(
    "analyitcs",
    analytics.selectStar()
);

yield userAdminAnalytics2.selectStar().stringify();
```
