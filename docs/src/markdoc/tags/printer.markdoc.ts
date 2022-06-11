import { Tag } from "@markdoc/markdoc";
import { format } from "sql-formatter";
import {
  sql as _sql,
  table as _table,
  unionAll as _unionAll,
} from "../../../../src";

import * as Babel from "@babel/standalone";

const table = _table;
const sql = _sql;
const unionAll = _unionAll;
const users = table(["id", "age", "name"], "users");
const admins = table(["id", "age", "name"], "adm", "admins");

export const printer = {
  render: "pre",
  attributes: {},
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    const tsCode = children
      .map((it) => it.children)
      .reduce((p, c) => [...p, ...c], [])
      .join("");

    const jsCode = Babel.transform(tsCode, {
      filename: "any.ts",
      presets: ["typescript"],
    }).code;

    return [
      children,
      new Tag(
        `Fence`,
        {
          ...attributes,
          ["language"]: "sql",
        },
        [format(eval(jsCode))]
      ),
    ];
  },
};
