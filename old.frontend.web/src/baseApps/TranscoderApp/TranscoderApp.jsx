import React from "react";
import LabeledLED from "@components/labeled/LabeledLED";
import Timer from "@components/Timer";
import HostLoginController from "./subViews/HostLoginController";
import HostLoggedInView from "./subViews/HostLoggedInView";

import SplitAppMessageBusProvider, {
  ROLE_TRANSCODER_APP,
} from "@providers/SplitAppMessageBusProvider";
import AppLayoutProvider from "@providers/AppLayoutProvider";
import TranscoderPhantomSessionProvider from "./subProviders/TranscoderPhantomSessionProvider";

import SystemModal, { THEME_DARKER } from "@components/SystemModal";
import useSocketContext from "@hooks/useSocketContext";
import useTranscoderPhantomSessionContext from "./subHooks/useTranscoderPhantomSessionContext";

import SpeakerIcon from "@icons/SpeakerIcon";

// import useDocumentTitle from "@hooks/useDocumentTitle";

export default function AppNetworkTranscoder() {
  return (
    <SplitAppMessageBusProvider role={ROLE_TRANSCODER_APP}>
      <TranscoderPhantomSessionProvider>
        <AppLayoutProvider>
          <AppNetworkTranscoderView />
        </AppLayoutProvider>
      </TranscoderPhantomSessionProvider>
    </SplitAppMessageBusProvider>
  );
}

function AppNetworkTranscoderView() {
  const { isConnected: isSocketConnected } = useSocketContext();

  const {
    realmId,
    channelId,
    isConnected: isSessionConnected,
    logout,
    getSessionUptime,
  } = useTranscoderPhantomSessionContext();

  // TODO: If running in an iframe, don't show this view by default

  return (
    <SystemModal
      theme={THEME_DARKER}
      headerView={() => {
        return (
          <nav style={{ padding: 2 }}>
            <SpeakerIcon
              style={{
                color: "inherit",
                fontSize: "2rem",
                verticalAlign: "middle",
              }}
            />{" "}
            <span style={{ fontWeight: "bold" }}>
              <span style={{ color: "orange" }}>speaker</span>
              .app
            </span>{" "}
            / <span style={{ fontStyle: "italic" }}>transcoder</span>
            <div style={{ float: "right" }}>
              {isSessionConnected && (
                <button
                  onClick={logout}
                  style={{ backgroundColor: "red", fontWeight: "bold" }}
                >
                  Disconnect
                </button>
              )}
            </div>
          </nav>
        );
      }}
      footerView={
        <div style={{ padding: 8 }}>
          <div style={{ float: "left", whiteSpace: "nowrap" }}>
            <LabeledLED
              color={isSocketConnected ? "green" : "white"}
              label="Online"
            />
            <LabeledLED
              color={isSessionConnected ? "green" : "white"}
              label="In Call"
            />
          </div>
          <div
            style={{
              display: "inline-block",
              color: isSessionConnected ? "inherit" : "gray",
            }}
          >
            {
              // TODO: Add
              // <span style={{ fontWeight: "bold" }}>[network name]</span>
            }
            {realmId && channelId && (
              <span style={{ fontSize: ".8rem" }}>
                {realmId} / {channelId}
              </span>
            )}
          </div>
          <div style={{ float: "right", marginTop: 8 }}>
            {
              // TODO: Rework to show phantom session uptime
            }
            <Timer
              onTick={getSessionUptime}
              style={{
                float: "right",
                color: isSessionConnected ? "inherit" : "gray",
              }}
            />
          </div>
        </div>
      }
    >
      {
        // TODO: Rework
      }
      {!isSessionConnected ? <HostLoginController /> : <HostLoggedInView />}
    </SystemModal>
  );
}
