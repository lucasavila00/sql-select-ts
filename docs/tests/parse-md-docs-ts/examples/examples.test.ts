import fs from "fs";
import path from "path";
import { parseAndTransform } from "../../../src/lib/use-document-content";
import Markdoc from "@markdoc/markdoc";
import "jest-specific-snapshot";
import { addSerializer } from "jest-specific-snapshot";
import prettier from "prettier";
addSerializer({
  test: (val: any) => typeof val === "string",
  print: (val: any) => val,
});

describe("examples", () => {
  it("inline code works", () => {
    const folderRelatievePath = "../../../examples/";
    const files = fs.readdirSync(path.join(__dirname, folderRelatievePath));
    for (const file of files) {
      const content = fs.readFileSync(
        path.join(__dirname, folderRelatievePath, file),
        "utf8"
      );

      const renderable = parseAndTransform(content);
      const html = Markdoc.renderers.html(renderable);
      expect(
        prettier.format(html, { filepath: "it.html" })
      ).toMatchSpecificSnapshot(`./${file}.html`);
    }
  });
});
