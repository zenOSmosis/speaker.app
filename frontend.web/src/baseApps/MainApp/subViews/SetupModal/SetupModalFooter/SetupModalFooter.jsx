import React from "react";
import { Row, Column } from "@components/Layout";
import ButtonTransparent from "@components/ButtonTransparent";
import Center from "@components/Center";
// import LabeledLED from "@components/labeled/LabeledLED";
import LabeledSwitch from "@components/labeled/LabeledSwitch";
import SpeakerIcon from "@icons/SpeakerIcon";
import LabeledIcon from "@components/labeled/LabeledIcon/LabeledIcon";

import SettingsIcon from "@icons/SettingsIcon";

import useAppRoutesContext from "@hooks/useAppRoutesContext";
// import useSocketContext from "@hooks/useSocketContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useInputMediaDevicesContext from "@hooks/useInputMediaDevicesContext";

import {
  ROUTE_HOME,
  ROUTE_CALL_URL,
  ROUTE_SETUP_CONFIGURE,
  ROUTE_SETUP_NETWORKS,
} from "@baseApps/MainApp/routes";

export default function SetupModalFooter() {
  const { openRoute, getIsCurrentRoute } = useAppRoutesContext();
  // const { isConnected: isSocketConnected } = useSocketContext();
  const {
    isConnected: isSessionConnected,
    realmId,
    channelId,
  } = useWebPhantomSessionContext();

  const {
    // hasUIMicPermission,
    // setHasUIMicPermission,
    micAudioController,
  } = useInputMediaDevicesContext();

  return (
    <Row>
      <Column style={{ whiteSpace: "nowrap" }}>
        <Center>
          <nav style={{ textAlign: "left", paddingLeft: 8 }}>
            {/*
              <LabeledLED
                color={isSocketConnected ? "green" : "white"}
                label="Online"
                style={{ verticalAlign: "bottom" }}
              />

              <LabeledLED
                color={isSessionConnected ? "green" : "white"}
                label="In Call"
              />
              */}

            {
              // TODO: Include "configure" LabledIcon and use it to configure audio
              // Audio option should include ability to suppress echo, etc.
            }
            <LabeledIcon
              label="Configure"
              onClick={() => openRoute(ROUTE_SETUP_CONFIGURE)}
              icon={SettingsIcon}
              disabled={getIsCurrentRoute(ROUTE_SETUP_CONFIGURE)}
            />

            <LabeledSwitch
              masterLabel="Mic"
              labelOn=""
              labelOff=""
              isOn={!micAudioController || !micAudioController.getIsMuted()}
              onChange={() =>
                micAudioController && micAudioController.toggleMute()
              }
              disabled={!isSessionConnected}
              style={{
                // opacity: !isConnected ? 0 : 1,
                verticalAlign: "bottom",
              }}
            />
          </nav>
        </Center>
      </Column>
      <Column style={{ textAlign: "right", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block" }}>
          <ButtonTransparent
            onClick={() =>
              // Speaker.app footer logo will open call screen if already on a
              // call; otherwise it will open main networks screen if not
              // already on that screen, and if on the screen it will hide the
              // setup modal
              !isSessionConnected
                ? !getIsCurrentRoute(ROUTE_SETUP_NETWORKS)
                  ? openRoute(ROUTE_SETUP_NETWORKS)
                  : openRoute(ROUTE_HOME)
                : openRoute(ROUTE_CALL_URL, { realmId, channelId })
            }
            style={{ marginRight: 8 }}
          >
            <SpeakerIcon
              style={{
                fontSize: "3rem",
                verticalAlign: "middle",
                color: "inherit",
              }}
            />{" "}
            <span style={{ color: "orange" }}>speaker</span>.app
          </ButtonTransparent>
        </div>
      </Column>
    </Row>
  );
}
