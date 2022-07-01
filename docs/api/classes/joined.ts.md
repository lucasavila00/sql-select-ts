---
title: classes/joined.ts
nav_order: 3
parent: Classes
layout: default
grand_parent: Api
---

## joined overview

Represents a source of data composed of JOINed tables or sub-selects.

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

## Joined (class)

Represents a source of data composed of JOINed tables or sub-selects.
This class is not meant to be used directly, but rather through methods in tables, or sub-selects.

**Signature**

```ts
export declare class Joined<Selection, Scope, Aliases, Ambiguous> {
  private constructor(
    /* @internal */
    public __props: {
      commaJoins: CommaJoin;
      properJoins: ProperJoin;
    }
  );
}
```

Added in v0.0.0

### select (property)

**Signature**

```ts
select: <NewSelection extends string>(
  f: (
    f: Record<Selection | Scope, SafeString> & NoSelectFieldsCompileError
  ) => Record<NewSelection, SafeString>
) => SelectStatement<Selection | Scope, NewSelection>;
```

Added in v0.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Selection | Scope, Selection>;
```

Added in v0.0.0

### selectStarOfAliases (property)

**Signature**

```ts
selectStarOfAliases: <TheAliases extends Aliases>(aliases: TheAliases[]) =>
  SelectStatement<
    | RemoveAliasFromSelection<TheAliases, Selection>
    | RemoveAliasFromSelection<TheAliases, Scope>,
    | RemoveAliasFromSelection<TheAliases, Selection>
    | RemoveAliasFromSelection<TheAliases, Scope>
  >;
```

Added in v0.0.0

### commaJoinTable (property)

**Signature**

```ts
commaJoinTable: <Selection2 extends string, Alias2 extends string>(
  table: Table<Selection2, Alias2>
) =>
  Joined<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | Exclude<Selection2, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### joinTable (property)

**Signature**

```ts
joinTable: <Selection2 extends string, Alias2 extends string>(
  operator: string,
  table: Table<Selection2, Alias2>
) =>
  JoinedFactory<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Extract<Selection, Selection2>,
    Ambiguous | Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### commaJoinStringifiedSelect (property)

**Signature**

```ts
commaJoinStringifiedSelect: <Selection2 extends string, Alias2 extends string>(
  alias: Alias2,
  select: StringifiedSelectStatement<Selection2>
) =>
  Joined<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>
  >;
```

Added in v0.0.3

### commaJoinSelect (property)

**Signature**

```ts
commaJoinSelect: <
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  alias: Alias2,
  select: SelectStatement<Scope2, Selection2>
) =>
  Joined<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### joinStringifiedSelect (property)

**Signature**

```ts
joinStringifiedSelect: <Selection2 extends string, Alias2 extends string>(
  operator: string,
  alias: Alias2,
  table: StringifiedSelectStatement<Selection2>
) =>
  JoinedFactory<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.3

### joinSelect (property)

**Signature**

```ts
joinSelect: <
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  operator: string,
  alias: Alias2,
  table: SelectStatement<Scope2, Selection2>
) =>
  JoinedFactory<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### commaJoinCompound (property)

**Signature**

```ts
commaJoinCompound: <
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  alias: Alias2,
  compound: Compound<Scope2, Selection2>
) =>
  Joined<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

### joinCompound (property)

**Signature**

```ts
joinCompound: <
  Scope2 extends string,
  Selection2 extends string,
  Alias2 extends string
>(
  operator: string,
  alias: Alias2,
  compound: Compound<Scope2, Selection2>
) =>
  JoinedFactory<
    Selection,
    | Scope
    | Exclude<Selection, Selection2>
    | Exclude<Exclude<Selection2, Selection>, Ambiguous>
    | `${Alias2}.${Selection2}`,
    Aliases | Alias2,
    Ambiguous | Extract<Selection2, Selection>,
    Extract<Selection2, Selection>
  >;
```

Added in v0.0.0

## JoinedFactory (class)

Constructor for join queries.
Allows the selection of the constraint to be done in another method call.

**Signature**

```ts
export declare class JoinedFactory<
  Selection,
  Scope,
  Aliases,
  Ambiguous,
  UsingPossibleKeys
> {
  private constructor(
    /* @internal */
    public __props: {
      commaJoins: CommaJoin;
      properJoins: ProperJoin;
      newProperJoin: Omit<ProperJoinItem, "constraint">;
    }
  );
}
```

Added in v0.0.0

### noConstraint (property)

**Signature**

```ts
noConstraint: () => Joined<Selection, Scope, Aliases, Ambiguous>;
```

Added in v0.0.0

### on (property)

**Signature**

```ts
on: (on: (fields: Record<Scope, SafeString>) => SafeString | SafeString[]) =>
  Joined<Selection, Scope, Aliases, Ambiguous>;
```

Added in v0.0.0

### using (property)

**Signature**

```ts
using: (keys: UsingPossibleKeys[]) =>
  Joined<Selection, Scope, Aliases, Ambiguous>;
```

Added in v0.0.0
