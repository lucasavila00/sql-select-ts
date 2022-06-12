import * as path from "path";
import * as fs from "fs";
import { clearTocAndFrontmatter } from "../../src/lib/clear-toc-frontmatter";

describe("clear TOC and Frontmatter from docs-ts export", () => {
  it("should clear TOC and Frontmatter from docs-ts export", () => {
    const str = fs.readFileSync(
      path.join(__dirname, "sample-with-toc.md"),
      "utf-8"
    );
    const result = clearTocAndFrontmatter(str);
    expect(result).toMatchSnapshot();
  });
});
