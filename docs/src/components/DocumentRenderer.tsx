import React, { FC } from "react";
import Markdoc from "@markdoc/markdoc";
import { fence } from "../markdoc/nodes/fence.markdoc";
import { printer } from "../markdoc/tags/printer.markdoc";
import { Fence } from "./Fence";

export const DocumentRenderer: FC<{
  data: string;
}> = ({ data }) => {
  const ast = Markdoc.parse(data);
  const content = Markdoc.transform(ast, {
    nodes: { fence },
    tags: { printer },
    variables: {},
  });
  const rendered = Markdoc.renderers.react(content, React, {
    components: { Fence },
  });

  return <>{rendered}</>;
};
