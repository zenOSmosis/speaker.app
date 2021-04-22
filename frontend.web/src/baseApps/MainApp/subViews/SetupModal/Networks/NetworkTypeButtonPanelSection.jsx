import React from "react";

import Section from "@components/Section";
import ButtonPanel from "@components/ButtonPanel";

import PadlockOpenIcon from "@icons/PadlockOpenIcon";
import PadlockCloseIcon from "@icons/PadlockCloseIcon";

import useAppRoutesContext from "@hooks/useAppRoutesContext";
import {
  ROUTE_SETUP_NETWORKS,
  ROUTE_SETUP_PRIVATE_NETWORKS,
} from "@baseApps/MainApp/routes";

export default function NetworkTypeButtonPanelSection() {
  const { openRoute, getIsCurrentRoute } = useAppRoutesContext();

  const isPrivateRoute = getIsCurrentRoute(ROUTE_SETUP_PRIVATE_NETWORKS);

  return (
    <Section>
      <div className="note">Select network type:</div>
      <ButtonPanel
        buttons={[
          {
            content: () => (
              <span>
                Public <PadlockOpenIcon style={{ fontSize: "1.2em" }} />
              </span>
            ),
            onClick: () => openRoute(ROUTE_SETUP_NETWORKS),
            isSelected: !isPrivateRoute,
          },
          {
            content: () => (
              <span>
                Private <PadlockCloseIcon style={{ fontSize: "1.2em" }} />
              </span>
            ),
            onClick: () => openRoute(ROUTE_SETUP_PRIVATE_NETWORKS),
            isSelected: isPrivateRoute,
          },
        ]}
      />
    </Section>
  );
}
