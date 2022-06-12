import { RenderableTreeNode } from "@markdoc/markdoc";

export type Section = {
  title: string;
  nodeName: string;
  id: string;
};
const collectHeadingsRecursing = (
  node: RenderableTreeNode,
  sections: Section[]
) => {
  if (node != null && typeof node != "string") {
    // Match all h1, h2, h3… tags
    if (node.name === "HeadingGrommet") {
      const title = node.children[0];

      if (typeof title === "string") {
        sections.push({
          ...node.attributes,
          title,
          nodeName: node.attributes["originalNodeName"],
          id: String(node.attributes["id"]),
        });
      }
    }

    if (node.children) {
      for (const child of node.children) {
        collectHeadingsRecursing(child, sections);
      }
    }
  }
  return sections;
};

export const collectHeadings = (node: RenderableTreeNode): Section[] =>
  collectHeadingsRecursing(node, []);
