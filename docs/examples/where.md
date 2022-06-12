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
const name = "Lucas";
users
  .selectStar()
  .where(
    (f) => sql`${f.name} = ${name}`
  )
  .print();
```

{% /printer %}

# Two Clauses

## One call

{% printer %}

```ts
const name = "Lucas";
users
  .selectStar()
  .where((f) => [
    sql`${f.name} = ${name}`,
    sql`${f.id} = 5`,
  ])
  .print();
```

{% /printer %}

## Two calls

{% printer %}

```ts
const id = 5;
users
  .selectStar()
  .where(
    (f) => sql`${f.name} = 'Lucas'`
  )
  .where((f) => sql`${f.id} = ${id}`)
  .print();
```

{% /printer %}
