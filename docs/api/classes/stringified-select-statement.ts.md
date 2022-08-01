---
title: classes/stringified-select-statement.ts
nav_order: 5
parent: Classes
layout: default
grand_parent: Api
---

## stringified-select-statement overview

Represents a select statement that was built from a raw string.

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

## AliasedStringifiedSelectStatement (class)

**Signature**

```ts
export declare class AliasedStringifiedSelectStatement<Selection, Alias, Scope, FlatScope>
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
  AliasedStringifiedSelectStatement<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0

## StringifiedSelectStatement (class)

Represents a select statement that was built from a raw string.

**Signature**

```ts
export declare class StringifiedSelectStatement<
  Selection,
  Alias,
  Scope,
  FlatScope
> {
  protected constructor(
    /* @internal */
    public __props: {
      readonly content: SafeString;
      readonly scope: ScopeStorage;
      readonly alias?: string;
    }
  );
}
```

Added in v2.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () =>
  SelectStatement<Selection, never, { [key in Alias]: Selection }, Selection>;
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
        fields: Record<Selection, SafeString> &
          SelectionOfScope<{ [key in Alias]: Selection }> &
          NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>)
) =>
  SelectStatement<
    NewSelection | SubSelection,
    never,
    { [key in Alias]: Selection },
    Selection
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
  AliasedStringifiedSelectStatement<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0

### stringify (property)

**Signature**

```ts
stringify: () => string;
```

Added in v2.0.0
