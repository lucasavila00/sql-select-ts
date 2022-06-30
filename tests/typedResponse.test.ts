import * as io from "io-ts";
import { AnyStringifyable, SelectionOf, table } from "../src";

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

describe("typed response", () => {
    test("it works", async () => {
        const t = table(["a", "b"], "t");

        const response = await ioTsResponse(t.selectStar(), {
            a: io.string,
            b: io.number,
        });

        response[0]?.a.charAt(0);
        response[0]?.b.toPrecision(2);

        //@ts-expect-error
        response[0]?.c;

        expect(1).toBe(1);
    });
});
