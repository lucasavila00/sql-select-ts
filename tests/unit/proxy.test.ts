import { isTheProxyObject, prefixedProxy } from "../../src/consume-fields";
const proxy = prefixedProxy("abc");
describe("isTheProxyObject", () => {
    it("works", () => {
        expect(isTheProxyObject(false)).toBe(false);
        expect(isTheProxyObject(null)).toBe(false);
        expect(isTheProxyObject(undefined)).toBe(false);
        expect(isTheProxyObject("abc")).toBe(false);
        expect(isTheProxyObject(123)).toBe(false);
        expect(isTheProxyObject(proxy)).toBe(true);
    });
});

describe("proxy", () => {
    it("works", () => {
        expect(proxy["a"]).toMatchInlineSnapshot(`
            Object {
              "_tag": "SafeString",
              "content": "\`abc\`.\`a\`",
            }
        `);
        expect(proxy["123"]).toMatchInlineSnapshot(`
            Object {
              "_tag": "SafeString",
              "content": "\`abc\`.\`123\`",
            }
        `);
        expect(proxy["123-456"]).toMatchInlineSnapshot(`
            Object {
              "_tag": "SafeString",
              "content": "\`abc\`.\`123-456\`",
            }
        `);
    });
});
