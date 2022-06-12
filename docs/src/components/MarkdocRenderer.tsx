import React, { FC, useEffect, useState } from "react";
import Markdoc, { RenderableTreeNode } from "@markdoc/markdoc";
import { Fence } from "./Fence";
import { Heading } from "grommet";

const HeadingGrommet: FC<{
  id: string;
  originalNodeName: string;
  children: JSX.Element;
}> = ({ children, originalNodeName, id }) => (
  <Heading
    level={(parseInt(originalNodeName.replace("h", "")) + 1) as any}
    id={id}
    style={{ scrollMargin: 100 }}
  >
    {children}
  </Heading>
);

const elementIdFromHash = (): string | null => {
  const hash = window.location.hash;
  if (hash == null) {
    return null;
  }
  return hash.replace("#", "");
};

export const MarkdocRenderer: FC<{
  content: RenderableTreeNode;
}> = ({ content }) => {
  useEffect(() => {
    const elementId = elementIdFromHash();
    if (elementId == null) {
      return;
    }
    const e = document.getElementById(elementId);
    if (e == null) {
      return;
    }
    e.scrollIntoView();
  }, []);

  const rendered = Markdoc.renderers.react(content, React, {
    components: { Fence, HeadingGrommet },
  });
  return <>{rendered}</>;
};
