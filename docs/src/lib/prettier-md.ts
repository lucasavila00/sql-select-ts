import prettier from "prettier";
import babelParser from "prettier/parser-babel";
import tsParser from "prettier/parser-typescript";
import mdParser from "prettier/parser-markdown";

export const prettyfyMd = (str: string): string =>
  prettier.format(str, {
    filepath: "any.md",
    plugins: [babelParser, tsParser, mdParser],
  });
