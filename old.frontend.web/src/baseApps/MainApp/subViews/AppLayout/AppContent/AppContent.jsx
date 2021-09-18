import React, { useRef } from "react";
import { Content, Row, Column } from "@components/Layout";
import AppContentMain from "./AppContentMain";
import LeftSidebar from "../LeftSidebar";
import RightSidebar from "../RightSidebar";
import classNames from "classnames";
import styles from "./AppContent.module.css";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useViewportSize from "@hooks/useViewportSize";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useForceUpdate from "@hooks/useForceUpdate";

export default function AppContent({
  // TODO: Remove; Obtain from context
  sidebarRenderTime,
  zenRTCPeer,
  isZenRTCConnected,
  sessionInfo,
  incomingVideoMediaStreamTracks,
  ...rest
}) {
  const { isSidebarOpen, isSidebarOverlay } = useAppLayoutContext();
  const { participants } = useWebPhantomSessionContext();

  const refSize = useRef({});

  // TODO: Move into AppLayoutProvider?
  const shouldShowLeftSidebar =
    participants.length > 1 && refSize.current.height > refSize.current.width;

  const forceUpdate = useForceUpdate();

  useViewportSize(({ width, height }) => {
    refSize.current = {
      width,
      height,
    };

    forceUpdate();
  });

  return (
    <Content>
      <Row className={styles["app-content"]}>
        {shouldShowLeftSidebar && (
          <Column style={{ width: 50, maxWidth: 50 }}>
            <LeftSidebar />
          </Column>
        )}
        <Column>
          <AppContentMain
            // TODO: Remove; Obtain from context
            zenRTCPeer={zenRTCPeer}
            isZenRTCConnected={isZenRTCConnected}
            sessionInfo={sessionInfo}
            incomingVideoMediaStreamTracks={incomingVideoMediaStreamTracks}
            {...rest}
          />
        </Column>
        <Column
          className={classNames(
            styles["sidebar-wrapper"],
            isSidebarOverlay ? styles["overlay"] : null,
            styles[isSidebarOpen ? "active" : "inactive"]
          )}
        >
          <RightSidebar
            // TODO: Remove; Obtain from context
            key={sidebarRenderTime}
            isOverlay={isSidebarOverlay}
            zenRTCPeer={zenRTCPeer}
            isZenRTCConnected={isZenRTCConnected}
            sessionInfo={sessionInfo}
            {...rest}
          />
        </Column>
      </Row>
    </Content>
  );
}
