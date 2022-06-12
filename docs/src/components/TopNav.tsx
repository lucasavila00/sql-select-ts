import React, { FC, useContext } from "react";
import { Anchor, Box, Header, Menu, Nav, ResponsiveContext } from "grommet";
import { AnchorLink } from "./AnchorLink";
import { useNavigate } from "react-router-dom";

export const CollapsableNav: FC = () => {
  const navigate = useNavigate();
  const responsive = useContext(ResponsiveContext);
  return (
    <Header background="dark-1" pad="medium">
      <Box direction="row" align="center" gap="small">
        <AnchorLink weight="normal" color="light-1" to="/">
          select-ts
        </AnchorLink>
      </Box>
      {responsive === "small" ? (
        <Menu
          items={[
            { label: "Examples", onClick: () => navigate("/examples") },
            { label: "API Reference", onClick: () => navigate("/api") },
            { label: "Source code", onClick: () => {} },
          ]}
        />
      ) : (
        <Nav direction="row">
          <AnchorLink to="/examples" label="Examples" />
          <AnchorLink to="/api" label="API Reference" />
          <Anchor href="#" label="Source code" />
        </Nav>
      )}
    </Header>
  );
};
