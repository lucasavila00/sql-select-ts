---
title: classes/common-table-expression.ts
nav_order: 1
parent: Classes
layout: default
grand_parent: Api
---

## common-table-expression overview

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

## CommonTableExpressionFactory (class)

**Signature**

```ts
export declare class CommonTableExpressionFactory<
  Selection,
  Alias,
  Scope,
  FlatScope
> {
  private constructor(
    /* @internal */
    public __props: {
      readonly ctes: ReadonlyArray<CTE>;
    }
  );
}
```

Added in v2.0.0

### with\_ (property)

**Signature**

```ts
with_: <NSelection extends string, NAlias extends string>(
  select: (acc: {
    [K in keyof Scope]: Table<
      Scope[K],
      never,
      { [k in K]: Scope[K] },
      Scope[K]
    >;
  }) => AliasedSelectStatement<NSelection, NAlias, any, any>
) =>
  CommonTableExpressionFactory<
    Selection,
    Alias,
    Scope & { [key in NAlias]: NSelection },
    FlatScope | NSelection
  >;
```

Added in v2.0.0

### withR (property)

**Signature**

```ts
withR: <NSelection extends string, NAlias extends string>(
  select: (acc: {
    [K in keyof Scope]: Table<
      Scope[K],
      never,
      { [k in K]: Scope[K] },
      Scope[K]
    >;
  }) => AliasedSelectStatement<any, NAlias, any, any>,
  columns: readonly NSelection[]
) =>
  CommonTableExpressionFactory<
    Selection,
    Alias,
    Scope & { [key in NAlias]: NSelection },
    FlatScope | NSelection
  >;
```

Added in v2.0.0

### do (property)

**Signature**

```ts
do: <NSelection extends string, NAlias extends string, NScope extends ScopeShape, NFlatScope extends string>(_: (acc: { [K in keyof Scope]: Table<Scope[K], never, { [k in K]: Scope[K]; }, Scope[K]>; }) => SelectStatement<NSelection, NAlias, NScope, NFlatScope>) => SelectStatement<NSelection, NAlias, NScope, NFlatScope>
```

Added in v2.0.0
