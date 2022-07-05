---
title: classes/common-table-expression.ts
nav_order: 1
parent: Classes
layout: default
grand_parent: Api
---

## common-table-expression overview

Added in v1.0.0

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
export declare class CommonTableExpressionFactory<Scope, Aliases> {
  private constructor(
    /* @internal */
    public __props: {
      readonly ctes: ReadonlyArray<CTE>;
    }
  );
}
```

Added in v1.0.0

### with\_ (property)

**Signature**

```ts
with_: <Selection2 extends string, Alias2 extends string>(
  alias: Alias2,
  select: (acc: {
    [K in Aliases]: Table<FilterStarting<Scope, K>, K>;
  }) => SelectStatement<any, Selection2>
) =>
  CommonTableExpressionFactory<
    Scope | `${Alias2}.${Selection2}`,
    Aliases | Alias2
  >;
```

Added in v1.0.0

### withR (property)

**Signature**

```ts
withR: <Selection2 extends string, Alias2 extends string>(
  alias: Alias2,
  columns: readonly Selection2[],
  select: (acc: {
    [K in Aliases]: Table<FilterStarting<Scope, K>, K>;
  }) => SelectStatement<any, any>
) =>
  CommonTableExpressionFactory<
    Scope | `${Alias2}.${Selection2}`,
    Aliases | Alias2
  >;
```

Added in v1.0.0

### do (property)

**Signature**

```ts
do: <A extends string, B extends string>(f: (acc: { [K in Aliases]: TableOrSubquery<K, Scope, FilterStarting<Scope, K> | `${K}.${FilterStarting<Scope, K>}`, any>; }) => SelectStatement<A, B>) => SelectStatement<A, B>
```

Added in v1.0.0
