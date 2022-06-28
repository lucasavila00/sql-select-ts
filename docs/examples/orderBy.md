We will use this table

```sql
CREATE TABLE users(id int, age int, name string);
```

Which is defined in typescript as

```ts
const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);
```

# One Clause

{% printer %}

```ts
users
  .selectStar()
  .orderBy((f) => f.age)
  .stringify();
```

{% /printer %}

# Two Clauses

## One call

{% printer %}

```ts
users
  .selectStar()
  .orderBy((f) => [
    sql`${f.age} DESC`,
    f.id,
  ])
  .stringify();
```

{% /printer %}

## Two calls

{% printer %}

```ts
users
  .selectStar()
  .orderBy((f) => f.age)
  .orderBy((f) => f.id)
  .stringify();
```

{% /printer %}
