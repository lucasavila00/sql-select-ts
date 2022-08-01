---
title: Typed response
nav_order: 23
parent: Examples
layout: default
---

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

```ts
import * as io from "io-ts";
import { AnyPrintable, SelectionOf, table, RowOf, RowsArray } from "../../src";
```

```ts
const t = table(["a", "b"], "t");
const q = t.selectStar();
```

# Getting Response Keys

```ts
type K = SelectionOf<typeof q>; // typeof K = 'a' | 'b'

// @ts-expect-error
const k2: K = "c";
```

# Response Object

```ts
type R1 = RowOf<typeof q>; // typeof Ret = {a: string | number | null | undefined, b: string | number | null | undefined, }
const ret1: R1 = { a: 1, b: null };
```

```ts
//@ts-expect-error
ret1.c;
```

# Response Array

```ts
type R2 = RowsArray<typeof q>; // typeof Ret = {a: string | number | null | undefined, b: string | number | null | undefined, }[]
const ret2: R2 = [] as any;
```

```ts
//@ts-expect-error
ret2?.[0]?.abc;
```

# Usage with io-ts

```ts
const ioTsResponse = <
    T extends AnyPrintable,
    C extends { [key in SelectionOf<T>]: io.Mixed }
>(
    _it: T,
    _codec: C
): Promise<io.TypeOf<io.TypeC<C>>[]> => {
    // Get the query string with it.stringify()
    // and implement the DB comms.
    return Promise.resolve([]);
};
```

```ts
const response = await ioTsResponse(t.selectStar(), {
    a: io.string,
    b: io.number,
});

response[0]?.a.charAt(0);
response[0]?.b.toPrecision(2);
```

```ts
//@ts-expect-error
response[0]?.c;
```

```ts
// @ts-expect-error
ioTsResponse(t.selectStar(), { a: io.string });
```

---

This document used [eval-md](https://lucasavila00.github.io/eval-md/)