import * as path from "path";
import * as fs from "fs";
import { prettyfyMd } from "../../src/lib/prettier-md";

describe("prettyfyMd", () => {
  it("should fromat the file", () => {
    const str = fs.readFileSync(
      path.join(__dirname, "sample-prettier.md"),
      "utf-8"
    );
    const result = prettyfyMd(str);
    expect(result).toMatchSnapshot();
  });
});
