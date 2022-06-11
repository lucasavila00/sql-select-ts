import React from "react";
import { table as _table, sql as _sql } from "../../src";
import Markdoc, { Tag } from "@markdoc/markdoc";
import useSWR from "swr";
import { format } from "sql-formatter";

const table = _table;
const sql = _sql;
const users = table(["id", "age", "name"], "users");

const printer = {
    render: "pre",
    children: ["pre"],
    attributes: {},
    transform(node, config) {
        const attributes = node.transformAttributes(config);
        const children = node.transformChildren(config);

        const text = children
            .map((it) => it.children)
            .reduce((p, c) => [...p, ...c], [])
            .join("");
        console.warn({ text, attributes, children, node });
        return [
            //
            children,
            new Tag(`pre`, { ...attributes, ["data-language"]: "sql" }, [
                format(eval(text)),
            ]),
        ];
    },
};

export function App() {
    const contentURL = new URL(
        "../content/select.md",
        import.meta.url
    ).toString();

    const { data } = useSWR(contentURL, (str) =>
        fetch(str).then((it) => it.text())
    );

    if (data == null) {
        return <></>;
    }

    const ast = Markdoc.parse(data);
    const content = Markdoc.transform(ast, {
        nodes: {},
        tags: { printer },
        variables: {},
    });
    const rendered = Markdoc.renderers.react(content, React, {
        components: {},
    });
    return <div className="markdown-body">{rendered}</div>;
}
