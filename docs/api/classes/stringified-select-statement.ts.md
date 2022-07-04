---
title: classes/stringified-select-statement.ts
nav_order: 5
parent: Classes
layout: default
grand_parent: Api
---

## stringified-select-statement overview

Represents a select statement that was built from a raw string.

Added in v0.0.3

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

# utils

## StringifiedSelectStatement (class)

Represents a select statement that was built from a raw string.

**Signature**

```ts
export declare class StringifiedSelectStatement<Selection> {
  private constructor(
    /* @internal */
    public __props: {
      readonly content: SafeString;
    }
  );
}
```

Added in v0.0.3

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection, Selection>;
```

Added in v0.0.3

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(
  f: (
    f: Record<Selection, SafeString> & NoSelectFieldsCompileError
  ) => Record<NewSelection, SafeString>
) => SelectStatement<Selection, NewSelection>;
```

Added in v0.0.3

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisQueryAlias: Alias1,
  table: Table<Selection2, Alias2>
) =>
  Joined<
    Selection,
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.3

### joinTable (property)

**Signature**

```ts
joinTable: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisQueryAlias: Alias1,
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

Added in v0.0.3

### commaJoinStringifiedSelect (property)

**Signature**

```ts
commaJoinStringifiedSelect: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
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
  thisSelectAlias: Alias1,
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

Added in v0.0.3

### joinStringifiedSelect (property)

**Signature**

```ts
joinStringifiedSelect: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
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
  thisSelectAlias: Alias1,
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

Added in v0.0.3

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
  compoundAlias: Alias2,
  compound: Compound<Selection2, Selection2>
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

Added in v0.0.3

### joinCompound (property)

**Signature**

```ts
joinCompound: <
  Alias1 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
  operator: string,
  compoundAlias: Alias2,
  compound: Compound<Selection2, Selection2>
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

Added in v0.0.3

### stringify (property)

**Signature**

```ts
stringify: () => string;
```

Added in v0.0.3
