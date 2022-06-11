import React, { FC } from "react";
import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import { Fence } from "./Fence";

export const MarkdocRenderer: FC<{
  content: RenderableTreeNode;
}> = ({ content }) => {
  const rendered = Markdoc.renderers.react(content, React, {
    components: { Fence },
  });

  return <>{rendered}</>;
};
