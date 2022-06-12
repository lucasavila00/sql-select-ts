import { useEffect } from "react";

const elementIdFromHash = (): string | null => {
  const hash = window.location.hash;
  if (hash == null) {
    return null;
  }
  return hash.replace("#", "");
};
export const useScrollIntoView = () => {
  useEffect(() => {
    const elementId = elementIdFromHash();
    if (elementId == null || elementId === "") {
      return;
    }
    const element = document.getElementById(elementId);
    if (element == null) {
      return;
    }
    element.scrollIntoView();
  }, []);
};
