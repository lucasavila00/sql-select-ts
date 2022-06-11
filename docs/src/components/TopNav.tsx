import React, { FC } from "react";
import { Anchor, Box, Header, Menu, Nav, ResponsiveContext } from "grommet";
import { AnchorLink } from "./AnchorLink";

export const CollapsableNav: FC = () => (
  <Header background="dark-1" pad="medium">
    <Box direction="row" align="center" gap="small">
      select-ts
    </Box>
    <ResponsiveContext.Consumer>
      {(responsive) =>
        responsive === "small" ? (
          <Menu
            label="Click me"
            items={[
              { label: "Examples", onClick: () => {} },
              { label: "API Reference", onClick: () => {} },
              { label: "Source code", onClick: () => {} },
            ]}
          />
        ) : (
          <Nav direction="row">
            <AnchorLink to="/examples" label="Examples" />
            <Anchor href="#" label="API Reference" />
            <Anchor href="#" label="Source code" />
          </Nav>
        )
      }
    </ResponsiveContext.Consumer>
  </Header>
);
