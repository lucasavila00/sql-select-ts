import React, { FC } from "react";
import {
  table as _table,
  sql as _sql,
  unionAll as _unionAll,
} from "../../src";
import Markdoc, {
  Tag,
} from "@markdoc/markdoc";
import useSWR from "swr";
import { format } from "sql-formatter";
import "prismjs";
import "prismjs/themes/prism-okaidia.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-sql";
import Prism from "react-prism";
import * as Babel from "@babel/standalone";

const table = _table;
const sql = _sql;
const unionAll = _unionAll;
const users = table(
  ["id", "age", "name"],
  "users"
);

const admins = table(
  ["id", "age", "name"],
  "adm",
  "admins"
);

const printer = {
  render: "pre",
  attributes: {},
  transform(node, config) {
    const attributes =
      node.transformAttributes(config);
    const children =
      node.transformChildren(config);

    const tsCode = children
      .map((it) => it.children)
      .reduce(
        (p, c) => [...p, ...c],
        []
      )
      .join("");

    const jsCode = Babel.transform(
      tsCode,
      {
        filename: "any.ts",
        presets: ["typescript"],
      }
    ).code;

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
const fence = {
  render: "Fence",
  attributes: {
    language: {
      type: String,
      description:
        "The programming language of the code block. Place it after the backticks.",
    },
  },
};
const Fence: FC<{
  children: JSX.Element;
  language: string;
}> = ({ children, language }) => {
  return (
    <Prism
      key={language}
      component="pre"
      className={`language-${language}`}
    >
      {children}
    </Prism>
  );
};
export function App() {
  const contentURL = new URL(
    "../content/select.md",
    import.meta.url
  ).toString();

  const { data } = useSWR(
    contentURL,
    (str) =>
      fetch(str).then((it) => it.text())
  );

  if (data == null) {
    return <></>;
  }

  const ast = Markdoc.parse(data);
  const content = Markdoc.transform(
    ast,
    {
      nodes: { fence },
      tags: { printer },
      variables: {},
    }
  );
  const rendered =
    Markdoc.renderers.react(
      content,
      React,
      {
        components: { Fence },
      }
    );
  return (
    <div className="markdown-body">
      {rendered}
    </div>
  );
}
