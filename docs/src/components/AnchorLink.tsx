import { Anchor, AnchorExtendedProps } from "grommet";
import React, { FC, startTransition, useState } from "react";
import { useNavigate } from "react-router-dom";

type AnchorLinkType = FC<
  Omit<AnchorExtendedProps, "href" | "onClick"> & {
    to: string;
  }
>;
export const AnchorLink: AnchorLinkType = ({ to, ...rest }) => {
  const navigate = useNavigate();
  // force Anchor to re-mount on click, so that it loses the pressed status
  const [k, setK] = useState(0);
  return (
    <Anchor
      href={to}
      key={k}
      onClick={(ev) => {
        ev.preventDefault();
        startTransition(() => {
          navigate(to);
          setK((it) => it + 1);
        });
      }}
      {...rest}
    />
  );
};
