---
title: classes/table.ts
nav_order: 6
parent: Classes
layout: default
grand_parent: Api
---

## table overview

Represents a table in the database.
It stores type information of the table Alias and Selection.
It also stores the table name and the alias.

Added in v2.0.0

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# utils

## Table (class)

Represents a table in the database.
It stores type information of the table Alias and Selection.
It also stores the table name and the alias.

This class is not meant to be used directly, but rather through the `table` function.

**Signature**

```ts
export declare class Table<Selection, Alias, Scope, FlatScope> {
  private constructor(
    /* @internal */
    public __props: {
      readonly columns: ReadonlyArray<string>;
      readonly alias: string;
      readonly name: string;
      readonly final: boolean;
      readonly scope: ScopeStorage;
    }
  );
}
```

Added in v2.0.0

### clickhouse (property)

**Signature**

```ts
clickhouse: {
  final: () => Table<Selection, Alias, Scope, FlatScope>;
}
```

Added in v2.0.0

### select (property)

**Signature**

```ts
select: <
  NewSelection extends string = never,
  SubSelection extends Selection = never
>(
  _:
    | readonly SubSelection[]
    | ((
        fields: RecordOfSelection<Selection> &
          SelectionOfScope<Scope> &
          NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>)
) => SelectStatement<NewSelection | SubSelection, never, Scope, FlatScope>;
```

Added in v2.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection, never, Scope, FlatScope>;
```

Added in v2.0.0

### commaJoin (property)

**Signature**

```ts
commaJoin: <
  Selection2 extends string = never,
  Alias2 extends string = never,
  Scope2 extends ScopeShape = never,
  FlatScope2 extends string = never
>(
  _: ValidAliasInSelection<
    Joinable<Selection2, Alias2, Scope2, FlatScope2>,
    Alias2
  >
) =>
  Joined<
    never,
    never,
    { [key in Alias]: Selection } & { [key in Alias2]: Selection2 },
    Selection | Selection2
  >;
```

Added in v2.0.0

### join (property)

**Signature**

```ts
join: <
  Selection2 extends string = never,
  Alias2 extends string = never,
  Scope2 extends ScopeShape = never,
  FlatScope2 extends string = never
>(
  operator: string,
  _: ValidAliasInSelection<
    Joinable<Selection2, Alias2, Scope2, FlatScope2>,
    Alias2
  >
) =>
  JoinedFactory<
    { [key in Alias]: Selection } & { [key in Alias2]: Selection2 },
    Extract<Selection, Selection2>
  >;
```

Added in v2.0.0

### apply (property)

**Signature**

```ts
apply: <Ret extends TableOrSubquery<any, any, any, any> = never>(
  fn: (it: this) => Ret
) => Ret;
```

Added in v2.0.0

### as (property)

**Signature**

```ts
as: <NewAlias extends string = never>(as: NewAlias) =>
  Table<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0
