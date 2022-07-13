```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Join", 8);
```

```ts eval
import {
    table,
    SafeString,
    dsql as sql,
    unionAll,
    fromStringifiedSelectStatement,
    castSafe,
} from "../../src";
```

We will use these tables

```sql
CREATE TABLE users(id int, age int, name string);
CREATE TABLE admins(id int, age int, name string);
CREATE TABLE analytics(id int, clicks int);
```

Which are defined in typescript as

```ts eval
const users = table(["id", "age", "name"], "users");

const admins = table(["id", "age", "name"], "adm", "admins");

const analytics = table(["id", "clicks"], "analytics");
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

```ts eval --out=sql
users
    .joinTable("LEFT", admins)
    .on((f) => equals(f["adm.id"], f["users.id"]))
    .selectStar()
    .stringify();
```

## Join Select

```ts eval --out=sql
admins
    .joinSelect("u", "LEFT", users.selectStar())
    .on((f) => equals(f["u.id"], f["adm.id"]))
    .selectStar()
    .stringify();
```

## Join Stringified Select

```ts eval --out=sql
const aQueryThatIsAString = users.selectStar().stringify();

const usersStringifiedQuery = fromStringifiedSelectStatement<
    "id" | "age" | "name"
>(castSafe(aQueryThatIsAString));

admins
    .joinStringifiedSelect("u", "LEFT", usersStringifiedQuery)
    .on((f) => equals(f["u.id"], f["adm.id"]))
    .selectStar()
    .stringify();
```

## Join Compound

```ts eval --out=sql
admins
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

```ts eval --out=sql
users
    .joinTable("LEFT", admins)
    .on((f) => equals(f["adm.id"], f["users.id"]))
    .joinTable("LEFT", analytics)
    .on((f) => equals(f["analytics.id"], f["users.id"]))
    .selectStar()
    .stringify();
```

## Join 3 Selects

```ts eval --out=sql
const userAndAdmin = users
    .selectStar()
    .joinSelect("users", "LEFT", "admins", admins.selectStar())
    .on((f) => equals(f["admins.id"], f["users.id"]));

const userAdminAnalytics = userAndAdmin
    .joinSelect("LEFT", "analytics", analytics.selectStar())
    .on((f) => equals(f["analytics.id"], f["users.id"]));

userAdminAnalytics.selectStar().stringify();
```

# USING

## Join Table

```ts eval --out=sql
users.joinTable("LEFT", admins).using(["id"]).selectStar().stringify();
```

## Join Select

```ts eval --out=sql
admins
    .joinSelect("u", "LEFT", users.selectStar())
    .using(["id"])
    .selectStar()
    .stringify();
```

# No Constraint

## Join Table

```ts eval --out=sql
users.joinTable("NATURAL", admins).noConstraint().selectStar().stringify();
```

## Join Select

```ts eval --out=sql
admins
    .joinSelect("u", "NATURAL", users.selectStar())
    .noConstraint()
    .selectStar()
    .stringify();
```

# Comma Join

## Join Table

```ts eval --out=sql
users.commaJoinTable(admins).selectStar().stringify();
```

## Join Select

```ts eval --out=sql
admins.commaJoinSelect("u", users.selectStar()).selectStar().stringify();
```

## Join Compound

```ts eval --out=sql
admins
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

```ts eval --out=sql
users.commaJoinTable(admins).commaJoinTable(analytics).selectStar().stringify();
```

## Join 3 Selects

```ts eval --out=sql
const userAndAdmin2 = users
    .selectStar()
    .commaJoinSelect("users", "admins", admins.selectStar());

const userAdminAnalytics2 = userAndAdmin2.commaJoinSelect(
    "analyitcs",
    analytics.selectStar()
);

userAdminAnalytics2.selectStar().stringify();
```
