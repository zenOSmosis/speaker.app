import React, { useEffect } from "react";
import useAppMenuItems from "./useAppMenuItems";
import Animation from "@components/Animation";
import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useKeyboardEvents from "@hooks/useKeyboardEvents";
import Layout, { Content } from "@components/Layout";
import RightSidebarMenu from "./RightSidebar.Menu";
import classNames from "classnames";
import styles from "./RightSidebar.module.css";

export default function RightSidebar({ ...params }) {
  const {
    // isSocketIoConnected,
    zenRTCPeer,
    isZenRTCConnected,
    isScreenSharing,
    sessionInfo,
    outgoingMediaStreamTracks,
    incomingMediaStreamTracks,
  } = params;

  const {
    isSidebarOpen: isOpen,
    onSelectedIdxChange,
    sidebarMenuSelectedIdx,
    setIsSidebarOpen,
    modalView,
  } = useAppLayoutContext();

  useKeyboardEvents({
    onKeyDown: keyCode => {
      // Ignore if there is an open modal
      if (modalView) {
        return;
      }

      // Close if on home menu screen and ESC key is pressed
      if (sidebarMenuSelectedIdx === -1 && keyCode === 27) {
        setIsSidebarOpen(false);
      }
    },
  });

  // TODO: I can't remember why I put this in here, but it makes the sidebar
  // open by default and it shouldn't be placed here
  /*
  useEffect(() => {
    setIsSidebarOpen(true);
  }, [setIsSidebarOpen]);
  */

  const appMenuItems = useAppMenuItems({
    zenRTCPeer,
    isZenRTCConnected,
    sessionInfo,
    // isMuted,
    // toggleMute,
    isScreenSharing,
    outgoingMediaStreamTracks,
    incomingMediaStreamTracks,
  });

  return (
    <Animation
      // animationName={isOpen ? "fadeIn" : null}
      // animationDuration=".5s"
      className={classNames(
        styles["right-sidebar"],
        styles[isOpen ? "active" : "inactive"]
        // "animate__animated animate__flipInY"
      )}
    >
      <Layout>
        <Content>
          <RightSidebarMenu
            onSelectedIdxChange={onSelectedIdxChange}
            isOpen={isOpen}
            items={appMenuItems}
            {...params}
          />
        </Content>
        {
          // TODO: Move this into its own applet
        }
        {/*
        <Footer>
        <MediaStreamerApplet
          onMediaStream={(mediaStream) =>
            zenRTCPeer.publishMediaStream(mediaStream)
          }
        />
      </Footer>
        */}
      </Layout>
    </Animation>
  );
}
