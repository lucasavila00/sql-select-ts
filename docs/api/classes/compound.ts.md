---
title: classes/compound.ts
nav_order: 1
parent: Classes
layout: default
grand_parent: Api
---

## compound overview

Represents https://www.sqlite.org/syntax/compound-select-stmt.html

Added in v0.0.0

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# utils

## Compound (class)

Represents https://www.sqlite.org/syntax/compound-select-stmt.html

This class is not meant to be used directly, but rather through the `union`, `union`, `insersect`, `except` functions.

**Signature**

```ts
export declare class Compound<Scope, Selection> {
  private constructor(
    /* @internal */
    public __props: {
      content: ReadonlyArray<TableOrSubquery<any, any, any, any>>;
      qualifier: "UNION" | "UNION ALL" | "INTERSECT" | "EXCEPT";
      orderBy: ReadonlyArray<SafeString>;
      limit: SafeString | number | null;
    }
  );
}
```

Added in v0.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (
  f: (
    fields: Record<Scope | Selection, SafeString>
  ) => SafeString[] | SafeString
) => Compound<Scope, Selection>;
```

Added in v0.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) => Compound<Scope, Selection>;
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(
  f: (
    fields: Record<Selection, SafeString> & NoSelectFieldsCompileError
  ) => Record<NewSelection, SafeString>
) => SelectStatement<Selection, NewSelection>;
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection, Selection>;
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  operator: string,
  table: Table<Selection2, Alias2>
) =>
  JoinedFactory<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias1}.${Selection}`
    | `${Alias2}.${Selection2}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
  table: Table<Selection2, Alias2>
) =>
  Joined<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias1}.${Selection}`
    | `${Alias2}.${Selection2}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### joinStringifiedSelect (property)

**Signature**

```ts
joinStringifiedSelect: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  operator: string,
  selectAlias: Alias2,
  select: StringifiedSelectStatement<Selection2>
) =>
  JoinedFactory<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.3

### joinSelect (property)

**Signature**

```ts
joinSelect: <
  Alias1 extends string,
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  operator: string,
  selectAlias: Alias2,
  select: SelectStatement<Scope2, Selection2>
) =>
  JoinedFactory<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### commaJoinStringifiedSelect (property)

**Signature**

```ts
commaJoinStringifiedSelect: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  selectAlias: Alias2,
  select: StringifiedSelectStatement<Selection2>
) =>
  Joined<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.3

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <
  Alias1 extends string,
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  selectAlias: Alias2,
  select: SelectStatement<Scope2, Selection2>
) =>
  Joined<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### joinCompound (property)

**Signature**

```ts
joinCompound: <
  Alias1 extends string,
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  operator: string,
  compoundAlias: Alias2,
  compound: Compound<Scope2, Selection2>
) =>
  JoinedFactory<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <
  Alias1 extends string,
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisCompoundAlias: Alias1,
  compoundAlias: Alias2,
  compound: Compound<Scope2, Selection2>
) =>
  Joined<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### stringify (property)

**Signature**

```ts
stringify: () => string;
```

Added in v0.0.0
