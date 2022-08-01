---
title: classes/select-statement.ts
nav_order: 4
parent: Classes
layout: default
grand_parent: Api
---

## select-statement overview

Represents https://www.sqlite.org/syntax/simple-select-stmt.html

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

## AliasedSelectStatement (class)

**Signature**

```ts
export declare class AliasedSelectStatement<Selection, Alias, Scope, FlatScope>
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

### stringify (property)

**Signature**

```ts
stringify: () => string;
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

### selectStar (property)

**Signature**

```ts
selectStar: () =>
  SelectStatement<Selection, never, { [key in Alias]: Selection }, Selection>;
```

Added in v2.0.0

### appendSelectStar (property)

**Signature**

```ts
appendSelectStar: () =>
  AliasedSelectStatement<
    Selection,
    Alias,
    Scope & { [key in Alias]: Selection },
    Selection
  >;
```

Added in v2.0.0

### as (property)

**Signature**

```ts
as: <NewAlias extends string = never>(as: NewAlias) =>
  AliasedSelectStatement<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0

## SelectStatement (class)

Represents https://www.sqlite.org/syntax/simple-select-stmt.html

This class is not meant to be used directly, but rather through the `fromNothing` function or from a table.

**Signature**

```ts
export declare class SelectStatement<Selection, Alias, Scope, FlatScope> {
  protected constructor(
    /**
     * @internal
     */
    public __props: {
      readonly from: TableOrSubquery<any, any, any, any> | null;
      readonly selection: SelectionWrapperTypes;
      readonly replace: ReplaceT<Selection>;
      readonly orderBy: ReadonlyArray<SafeString>;
      readonly groupBy: ReadonlyArray<SafeString>;
      readonly limit: SafeString | number | null;
      readonly where: ReadonlyArray<SafeString>;
      readonly prewhere: ReadonlyArray<SafeString>;
      readonly having: ReadonlyArray<SafeString>;
      readonly distinct: boolean;
      readonly clickhouseWith: ReadonlyArray<ClickhouseWith>;
      readonly ctes: ReadonlyArray<CTE>;
      readonly alias?: string;
      readonly scope: ScopeStorage;
    }
  );
}
```

Added in v2.0.0

### clickhouse (property)

Clickhouse specific syntax extensions.

**Signature**

```ts
clickhouse: {
  with_: <NewSelection extends string>(
    it: Record<
      NewSelection,
      | SelectStatement<any, any, any, any>
      | AliasedSelectStatement<any, any, any, any>
      | StringifiedSelectStatement<any, any, any, any>
      | AliasedStringifiedSelectStatement<any, any, any, any>
    >
  ) => SelectStatement<Selection | NewSelection, Alias, Scope, FlatScope | NewSelection>
  prewhere: (
    f:
      | readonly (Selection | FlatScope)[]
      | ((fields: Record<Selection | FlatScope, SafeString>) => ReadonlyArray<SafeString> | SafeString)
  ) => SelectStatement<Selection, Alias, Scope, FlatScope>
  replace: (
    _: (
      f: Record<Selection | FlatScope, SafeString> & SelectionOfScope<Scope> & NoSelectFieldsCompileError
    ) => ReplaceT<Selection>
  ) => SelectStatement<Selection, Alias, Scope, FlatScope>
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
        fields: RecordOfSelection<Selection> & NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>)
) =>
  SelectStatement<
    NewSelection | SubSelection,
    never,
    Record<string, never>,
    Selection
  >;
```

Added in v2.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () =>
  SelectStatement<Selection, never, { [key in Alias]: Selection }, Selection>;
```

Added in v2.0.0

### appendSelectStar (property)

**Signature**

```ts
appendSelectStar: () => SelectStatement<Selection, Alias, Scope, Selection>;
```

Added in v2.0.0

### appendSelect (property)

**Signature**

```ts
appendSelect: <NewSelection extends string = never>(
  _:
    | readonly Selection[]
    | ((
        fields: RecordOfSelection<Selection> &
          RecordOfSelection<FlatScope> &
          SelectionOfScope<Scope> &
          NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>)
) => SelectStatement<Selection | NewSelection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### where (property)

**Signature**

```ts
where: (
  f:
    | readonly (Selection | FlatScope)[]
    | ((
        fields: Record<Selection | FlatScope, SafeString> &
          SelectionOfScope<Scope>
      ) => ReadonlyArray<SafeString> | SafeString)
) => SelectStatement<Selection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### having (property)

**Signature**

```ts
having: (
  f:
    | readonly (Selection | FlatScope)[]
    | ((
        fields: Record<Selection | FlatScope, SafeString>
      ) => ReadonlyArray<SafeString> | SafeString)
) => SelectStatement<Selection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### distinct (property)

**Signature**

```ts
distinct: () => SelectStatement<Selection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (
  f:
    | readonly (Selection | FlatScope)[]
    | ((
        fields: Record<Selection | FlatScope, SafeString> &
          SelectionOfScope<Scope>
      ) => ReadonlyArray<SafeString> | SafeString)
) => SelectStatement<Selection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### groupBy (property)

**Signature**

```ts
groupBy: (
  f:
    | readonly (Selection | FlatScope)[]
    | ((
        fields: Record<Selection | FlatScope, SafeString>
      ) => ReadonlyArray<SafeString> | SafeString)
) => SelectStatement<Selection, Alias, Scope, FlatScope>;
```

Added in v2.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) =>
  SelectStatement<Selection, Alias, Scope, FlatScope>;
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

### stringify (property)

**Signature**

```ts
stringify: () => string;
```

Added in v2.0.0

### as (property)

**Signature**

```ts
as: <NewAlias extends string = never>(as: NewAlias) =>
  AliasedSelectStatement<Selection, NewAlias, Scope, FlatScope>;
```

Added in v2.0.0
