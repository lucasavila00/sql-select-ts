import { Schema, Tag } from "@markdoc/markdoc";
import { format } from "sql-formatter";
import {
  SafeString,
  sql as _sql,
  table as _table,
  unionAll as _unionAll,
  castSafe as _castSafe,
  fromNothing as _fromNothing,
} from "../../../../lib/src";

import * as Babel from "@babel/standalone";

const table = _table;
const sql = _sql;
const unionAll = _unionAll;
const castSafe = _castSafe;
const fromNothing = _fromNothing;

const users = table(
  /* columns: */ ["id", "age", "name"],
  /* db-name & alias: */ "users"
);

const admins = table(
  /* columns: */ ["id", "age", "name"],
  /* alias: */ "adm",
  /* db-name: */ "admins"
);

const analytics = table(
  /* columns: */ ["id", "clicks"],
  /* db-name & alias: */ "analytics"
);

const equals = (
  a: SafeString | number | string,
  b: SafeString | number | string
): SafeString => sql`${a} = ${b}`;

const OR = (cases: SafeString[]): SafeString => {
  const j = cases.map((it) => it.content).join(" OR ");
  return castSafe(`(${j})`);
};

export const printer: Schema = {
  render: "pre",
  attributes: {},
  transform(node, config) {
    const attributes = node.transformAttributes(config);
    const children = node.transformChildren(config);

    const tsCode = children
      .map((it) => {
        if (typeof it === "string") {
          return [];
        }
        return it?.children ?? [];
      })
      .reduce((p, c) => [...p, ...c], [])
      .join("");

    const jsCode = Babel.transform(tsCode, {
      filename: "any.ts",
      presets: ["typescript"],
    }).code;

    return [
      ...children,
      new Tag(
        `Fence`,
        {
          ...attributes,
          ["language"]: "sql",
        },
        ["# formatted by sql-formatter\n" + format(eval(jsCode!))]
      ),
    ];
  },
};
