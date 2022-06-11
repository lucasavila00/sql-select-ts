import React, { FC } from "react";
import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import { Fence } from "./Fence";
import { Heading } from "grommet";

const HeadingGrommet: FC<{
  id: string;
  originalNodeName: string;
  children: JSX.Element;
}> = ({ children, originalNodeName, id }) => (
  <Heading level={originalNodeName.replace("h", "") as any} id={id}>
    {children}
  </Heading>
);

export const MarkdocRenderer: FC<{
  content: RenderableTreeNode;
}> = ({ content }) => {
  const rendered = Markdoc.renderers.react(content, React, {
    components: { Fence, HeadingGrommet },
  });
  return <>{rendered}</>;
};
