export const clearTocAndFrontmatter = (str: string): string => {
  const lines = str.split("\n");

  let isIgnoring = false;
  const toRet: string[] = [];

  lines.forEach((line) => {
    if (line.startsWith("---")) {
      isIgnoring = !isIgnoring;
    } else {
      if (!isIgnoring) {
        toRet.push(line);
      }
    }
  });

  return toRet.join("\n").trim();
};
