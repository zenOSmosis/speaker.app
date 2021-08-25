import React from "react";
import { Footer, Row, Column } from "@components/Layout";
import ButtonTransparent from "@components/ButtonTransparent";
import Center from "@components/Center";
import { AudioMediaStreamTrackLevelMeter } from "@components/AudioLevelMeter";

import PanelParticipantsScroller, {
  HORIZONTAL_ORIENTATION,
} from "../../PanelParticipantsScroller";

import MicrophoneIcon from "@icons/MicrophoneIcon";
import SidebarIcon from "@icons/SidebarIcon";
import BackArrowIcon from "@icons/BackArrowIcon";

import classNames from "classnames";
import styles from "./AppFooter.module.css";

// import useZenRTCContext from "@hooks/useZenRTCContext";
import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";

// TODO: Hide if there is main view content, or menu is shown, and we don't have much height

export default function AppFooter({ className }) {
  const { publishableAudioInputControllerCollection } =
    useInputMediaDevicesContext();

  const { toggleSidebar, sidebarMenuSelectedIdx, isSidebarOpen } =
    useAppLayoutContext();

  const isMicOff =
    publishableAudioInputControllerCollection.getChildren().length === 0;

  return (
    <Footer>
      <Row className={classNames(styles["app-footer"], className)}>
        <Column className={styles["left-column"]}>
          <Center>
            <div className={styles["content-wrap"]}>
              <ButtonTransparent
                onClick={() =>
                  publishableAudioInputControllerCollection.toggleMute()
                }
                disabled={isMicOff}
              >
                <div>
                  <MicrophoneIcon
                    className={styles["icon"]}
                    style={{
                      marginLeft: 7,
                      color: isMicOff
                        ? "gray"
                        : !publishableAudioInputControllerCollection.getIsMuted()
                        ? "red"
                        : "white",
                    }}
                  />
                  <AudioMediaStreamTrackLevelMeter
                    mediaStreamTracks={(() => {
                      const mediaStream =
                        publishableAudioInputControllerCollection.getOutputMediaStream();

                      if (mediaStream) {
                        return mediaStream.getAudioTracks();
                      }
                    })()}
                    style={{
                      marginLeft: 5,
                      marginBottom: 2,
                      height: 24,
                      width: 10,
                    }}
                  />
                </div>
                <div className={styles["icon-label"]}>{`Mic ${
                  !publishableAudioInputControllerCollection
                    ? "Off"
                    : !publishableAudioInputControllerCollection.getIsMuted()
                    ? "Active"
                    : "Muted"
                }`}</div>
              </ButtonTransparent>
            </div>
          </Center>
        </Column>

        <Column className={styles["center-column"]}>
          <Center className={styles["center-wrap"]}>
            <PanelParticipantsScroller orientation={HORIZONTAL_ORIENTATION} />
          </Center>
        </Column>

        <Column className={styles["right-column"]}>
          <Center>
            <div className={styles["content-wrap"]}>
              <ButtonTransparent onClick={toggleSidebar}>
                <div>
                  {sidebarMenuSelectedIdx === -1 ? (
                    <SidebarIcon
                      className={styles["icon"]}
                      style={{
                        color: isSidebarOpen ? "#059fff" : "inherit",
                      }}
                    />
                  ) : (
                    <BackArrowIcon
                      className={styles["icon"]}
                      style={{
                        color: "orange",
                      }}
                    />
                  )}
                </div>
                <div className={styles["icon-label"]}>Menu</div>
              </ButtonTransparent>
            </div>
          </Center>
        </Column>
      </Row>
    </Footer>
  );
}
