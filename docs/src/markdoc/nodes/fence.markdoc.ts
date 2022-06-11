import { Schema } from "@markdoc/markdoc";

export const fence: Schema = {
  render: "Fence",
  attributes: {
    content: { type: String },
    language: { type: String },
  },
};
