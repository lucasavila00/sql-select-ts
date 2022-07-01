---
title: classes/select-statement.ts
nav_order: 4
parent: Classes
layout: default
grand_parent: Api
---

## select-statement overview

Represents https://www.sqlite.org/syntax/simple-select-stmt.html

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

## SelectStatement (class)

Represents https://www.sqlite.org/syntax/simple-select-stmt.html

This class is not meant to be used directly, but rather through the `fromNothing` function or from a table.

**Signature**

```ts
export declare class SelectStatement<Scope, Selection> {
  private constructor(
    /* @internal */
    public __props: {
      from: TableOrSubquery<any, any, any, any> | null;
      selection: SelectionWrapperTypes<Selection>;
      replace: ReplaceT<Selection>;
      orderBy: SafeString[];
      groupBy: SafeString[];
      limit: SafeString | number | null;
      where: SafeString[];
      prewhere: SafeString[];
      having: SafeString[];
      distinct: boolean;
      clickhouseWith: ClickhouseWith[];
    }
  );
}
```

Added in v0.0.0

### clickhouse (property)

Clickhouse specific syntax extensions.

**Signature**

```ts
clickhouse: {
  with_: <NewSelection extends string>(
    it: Record<NewSelection, SelectStatement<any, any> | StringifiedSelectStatement<any>>
  ) => SelectStatement<Scope | NewSelection, Selection>
  prewhere: (f: (fields: Record<Scope | Selection, SafeString>) => SafeString[] | SafeString) =>
    SelectStatement<Scope, Selection>
  replace: <NewSelection extends string>(
    f: (f: Record<Selection | Scope, SafeString> & NoSelectFieldsCompileError) => ReplaceT<Selection>
  ) => SelectStatement<Scope, Selection | NewSelection>
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(
  f: (
    f: Record<Selection, SafeString> & NoSelectFieldsCompileError
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

### appendSelectStar (property)

**Signature**

```ts
appendSelectStar: () => SelectStatement<Selection, Selection>;
```

Added in v0.0.0

### appendSelect (property)

**Signature**

```ts
appendSelect: <NewSelection extends string>(
  f: (
    f: Record<Selection | Scope, SafeString> & NoSelectFieldsCompileError
  ) => Record<NewSelection, SafeString>
) => SelectStatement<Scope, Selection | NewSelection>;
```

Added in v0.0.0

### where (property)

**Signature**

```ts
where: (
  f: (
    fields: Record<Scope | Selection, SafeString>
  ) => SafeString[] | SafeString
) => SelectStatement<Scope, Selection>;
```

Added in v0.0.0

### having (property)

**Signature**

```ts
having: (
  f: (
    fields: Record<Scope | Selection, SafeString>
  ) => SafeString[] | SafeString
) => SelectStatement<Scope, Selection>;
```

Added in v0.0.0

### distinct (property)

**Signature**

```ts
distinct: () => SelectStatement<Scope, Selection>;
```

Added in v0.0.0

### orderBy (property)

**Signature**

```ts
orderBy: (
  f: (
    fields: Record<Scope | Selection, SafeString>
  ) => SafeString[] | SafeString
) => SelectStatement<Scope, Selection>;
```

Added in v0.0.0

### groupBy (property)

**Signature**

```ts
groupBy: (
  f: (
    fields: Record<Scope | Selection, SafeString>
  ) => SafeString[] | SafeString
) => SelectStatement<Scope, Selection>;
```

Added in v0.0.0

### limit (property)

**Signature**

```ts
limit: (limit: SafeString | number) => SelectStatement<Scope, Selection>;
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
  thisQueryAlias: Alias1,
  table: Table<Selection2, Alias2>
) =>
  Joined<
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias1}.${Selection}`,
    Alias1 | Alias2,
    Extract<Selection2, Selection>
  >;
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
  thisQueryAlias: Alias1,
  operator: string,
  table: Table<Selection2, Alias2>
) =>
  JoinedFactory<
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
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias2}.${Selection2}`
    | `${Alias1}.${Selection}`,
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
  thisSelectAlias: Alias1,
  operator: string,
  selectAlias: Alias2,
  select: StringifiedSelectStatement<Selection2>
) =>
  JoinedFactory<
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
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
  compoundAlias: Alias2,
  compound: Compound<Selection2, Selection2>
) =>
  Joined<
    | Exclude<Selection, Selection2>
    | Exclude<Selection2, Selection>
    | `${Alias1}.${Selection}`
    | `${Alias2}.${Selection2}`,
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
  Selection2 extends string,
  Alias2 extends string
>(
  thisSelectAlias: Alias1,
  operator: string,
  compoundAlias: Alias2,
  compound: Compound<Selection2, Selection2>
) =>
  JoinedFactory<
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

### stringify (property)

**Signature**

```ts
stringify: () => string;
```

Added in v0.0.0
