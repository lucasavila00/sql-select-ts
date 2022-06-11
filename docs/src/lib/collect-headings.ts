import { RenderableTreeNode } from "@markdoc/markdoc";

export type Section = {
  title: string;
  tagName: string;
  id: string;
};
const collectHeadingsRecursing = (
  node: RenderableTreeNode,
  sections: Section[]
) => {
  if (node != null && typeof node != "string") {
    // Match all h1, h2, h3… tags
    if (node.name?.match(/h\d/)) {
      const title = node.children[0];

      if (typeof title === "string") {
        sections.push({
          ...node.attributes,
          title,
          tagName: node.name,
          id: String(node.attributes.id),
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
