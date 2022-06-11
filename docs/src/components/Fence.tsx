import React, { FC } from "react";
import Prism from "react-prism";

export const Fence: FC<{
  children: JSX.Element;
  language: string;
}> = ({ children, language }) => (
  <Prism key={language} component="pre" className={`language-${language}`}>
    {children}
  </Prism>
);
