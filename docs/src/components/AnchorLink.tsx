import { Anchor, AnchorExtendedProps } from "grommet";
import React, { FC, startTransition } from "react";
import { useNavigate } from "react-router-dom";

type AnchorLinkType = FC<
  Omit<AnchorExtendedProps, "href" | "onClick"> & {
    to: string;
  }
>;
export const AnchorLink: AnchorLinkType = ({ to, ...rest }) => {
  const navigate = useNavigate();
  return (
    <Anchor
      href={to}
      onClick={(ev) => {
        startTransition(() => {
          navigate(to);
        });
        ev.preventDefault();
      }}
      {...rest}
    />
  );
};
