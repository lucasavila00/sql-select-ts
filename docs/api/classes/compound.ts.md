---
title: classes/compound.ts
nav_order: 2
parent: Classes
layout: default
grand_parent: Api
---

## compound overview

Represents https://www.sqlite.org/syntax/compound-select-stmt.html

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

## AliasedCompound (class)

**Signature**

```ts
export declare class AliasedCompound<Selection, Alias, Scope, FlatScope>
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
  AliasedCompound<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0

## Compound (class)

Represents https://www.sqlite.org/syntax/compound-select-stmt.html

This class is not meant to be used directly, but rather through the `union`, `union`, `intersect`, `except` functions.

**Signature**

```ts
export declare class Compound<Selection, Alias, Scope, FlatScope> {
  protected constructor(
    /* @internal */
    public __props: {
      readonly content: ReadonlyArray<TableOrSubquery<any, any, any, any>>;
      readonly qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT";
      readonly orderBy: ReadonlyArray<SafeString>;
      readonly limit: SafeString | number | null;
      readonly scope: ScopeStorage;
      readonly alias?: string;
    }
  );
}
```

Added in v2.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (
  f:
    | readonly (Selection | FlatScope)[]
    | ((
        fields: Record<Selection | FlatScope, SafeString>
      ) => ReadonlyArray<SafeString> | SafeString)
) => Compound<Selection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) =>
  Compound<Selection, Alias, Scope, FlatScope>;
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
        fields: RecordOfSelection<FlatScope> &
          SelectionOfScope<Scope> &
          NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>)
) => SelectStatement<NewSelection | SubSelection, never, Scope, FlatScope>;
```

Added in v2.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () =>
  SelectStatement<Selection, never, { [key in Alias]: Selection }, Selection>;
```

Added in v2.0.0

### stringify (property)

**Signature**

```ts
stringify: () => string;
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
  AliasedCompound<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0
