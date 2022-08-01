---
title: classes/joined.ts
nav_order: 3
parent: Classes
layout: default
grand_parent: Api
---

## joined overview

Represents a source of data composed of JOINed tables or sub-selects.

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

## Joined (class)

Represents a source of data composed of JOINed tables or sub-selects.
This class is not meant to be used directly, but rather through methods in tables, or sub-selects.

**Signature**

```ts
export declare class Joined<Selection, _Alias, Scope, FlatScope> {
  private constructor(
    /* @internal */
    public __props: {
      readonly commaJoins: CommaJoin;
      readonly properJoins: ProperJoin;
      readonly scope: ScopeStorage;
    }
  );
}
```

Added in v2.0.0

### select (property)

**Signature**

```ts
select: <
  NewSelection extends string = never,
  SubSelection extends Selection | FlatScope = never
>(
  _:
    | readonly SubSelection[]
    | ((
        fields: RecordOfSelection<Scope[keyof Scope]> &
          SelectionOfScope<Scope> &
          NoSelectFieldsCompileError
      ) => Record<NewSelection, SafeString>)
) => SelectStatement<NewSelection | SubSelection, never, Scope, FlatScope>;
```

Added in v2.0.0

### selectStar (property)

**Signature**

```ts
selectStar: () => SelectStatement<Scope[keyof Scope], never, Scope, FlatScope>;
```

Added in v2.0.0

### selectStarOfAliases (property)

**Signature**

```ts
selectStarOfAliases: <TheAliases extends keyof Scope>(
  aliases: readonly TheAliases[]
) => SelectStatement<Scope[TheAliases], never, Scope, FlatScope>;
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
    Scope & { [key in Alias2]: Selection2 },
    Extract<Selection, Selection2> | Extract<Scope[keyof Scope], Selection2>
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
) => Joined<never, never, Scope & { [key in Alias2]: Selection2 }, never>;
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

## JoinedFactory (class)

Constructor for join queries.
Allows the selection of the constraint to be done in another method call.

**Signature**

```ts
export declare class JoinedFactory<Scope, Using> {
  private constructor(
    /* @internal */
    public __props: {
      readonly commaJoins: CommaJoin;
      readonly properJoins: ProperJoin;
      readonly newProperJoin: Omit<ProperJoinItem, "constraint">;
      readonly scope: ScopeStorage;
    }
  );
}
```

Added in v2.0.0

### noConstraint (property)

**Signature**

```ts
noConstraint: () => Joined<never, never, Scope, Scope[keyof Scope]>;
```

Added in v2.0.0

### on (property)

**Signature**

```ts
on: (
  _: (
    fields: RecordOfSelection<Scope[keyof Scope]> & SelectionOfScope<Scope>
  ) => SafeString | ReadonlyArray<SafeString>
) => Joined<never, never, Scope, Scope[keyof Scope]>;
```

Added in v2.0.0

### using (property)

**Signature**

```ts
using: (keys: ReadonlyArray<Using>) =>
  Joined<never, never, Scope, Scope[keyof Scope]>;
```

Added in v2.0.0
