```ts eval --out=md --hide
import { exampleHeader } from "./ts-utils";
exampleHeader("Typed response", 23);
```

```ts eval
import * as io from "io-ts";
import {
    AnyStringifyable,
    SelectionOf,
    table,
    RowOf,
    RowsArray,
} from "../../src";
```

```ts eval
const t = table(["a", "b"], "t");
const q = t.selectStar();
```

# Getting Response Keys

```ts eval
type K = SelectionOf<typeof q>; // typeof K = 'a' | 'b'

// @ts-expect-error
const k2: K = "c";
```

# Response Object

```ts eval --out=hide
type R1 = RowOf<typeof q>; // typeof Ret = {a: string | number | null | undefined, b: string | number | null | undefined, }
const ret1: R1 = { a: 1, b: null };
```

```ts eval --out=hide
//@ts-expect-error
ret1.c;
```

# Response Array

```ts eval --out=hide
type R2 = RowsArray<typeof q>; // typeof Ret = {a: string | number | null | undefined, b: string | number | null | undefined, }[]
const ret2: R2 = [] as any;
```

```ts eval --out=hide
//@ts-expect-error
ret2?.[0]?.abc;
```

# Usage with io-ts

```ts eval
const ioTsResponse = <
    T extends AnyStringifyable,
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

```ts eval --out=hide
const response = await ioTsResponse(t.selectStar(), {
    a: io.string,
    b: io.number,
});

response[0]?.a.charAt(0);
response[0]?.b.toPrecision(2);
```

```ts eval --out=hide
//@ts-expect-error
response[0]?.c;
```

```ts eval --out=hide
// @ts-expect-error
ioTsResponse(t.selectStar(), { a: io.string });
```
