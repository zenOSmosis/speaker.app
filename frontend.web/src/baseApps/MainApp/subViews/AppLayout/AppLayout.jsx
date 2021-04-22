import React from "react";

import Animation from "@components/Animation";
import Cover from "@components/Cover";
import Center from "@components/Center";
import StaggeredWaveLoading from "@components/StaggeredWaveLoading";
import FullViewport from "@components/FullViewport";
import Layout from "@components/Layout";

import AppHeader from "./AppHeader";
import AppContent from "./AppContent";
import AppFooter from "./AppFooter";

import { ROUTE_CALL_DISCONNECT } from "@baseApps/MainApp/routes";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useAppRoutesContext from "@hooks/useAppRoutesContext";

export default function AppLayout() {
  const {
    realmId,
    channelId,
    zenRTCPeer,
    isConnected,
  } = useWebPhantomSessionContext();

  const { activeRoute } = useAppRoutesContext();

  // Prevent rendering if no active app route
  //
  // NOTE: There is a 404 handler in the routes which will intercede for this
  // condition
  if (!activeRoute) {
    return null;
  }

  return (
    <FullViewport>
      <Animation animationName="fadeIn">
        <Layout>
          <AppHeader />
          <AppContent
            // TODO: Remove these props
            realmId={realmId}
            channelId={channelId}
            zenRTCPeer={zenRTCPeer}
            isZenRTCConnected={isConnected}
          />
          <AppFooter />
        </Layout>

        {
          // Modals overlay main content
        }
        <ModalView />

        {
          // ConnectingView overlays everything
        }
        <ConnectingView />
      </Animation>
    </FullViewport>
  );
}

/**
 * Handler for modal overlays.
 */
function ModalView() {
  const { modalView } = useAppLayoutContext();

  return modalView ? <Cover>{modalView}</Cover> : null;
}

function ConnectingView() {
  const {
    isConnecting,
    realmId,
    channelId,
    isHostOnline,
  } = useWebPhantomSessionContext();

  const { openRoute } = useAppRoutesContext();

  return isConnecting ? (
    <Cover style={{ backgroundColor: "rgba(0,0,0,.7)" }}>
      <Center>
        <div>
          <div style={{ fontSize: "4vh" }}>Connecting</div>
          <div>
            <StaggeredWaveLoading />
          </div>
          {/*
      // TODO: Implement
      <div>
        <button>Cancel</button>
      </div>
      */}
        </div>
      </Center>
    </Cover>
  ) : realmId && channelId && !isHostOnline ? (
    <Cover style={{ backgroundColor: "rgba(0,0,0,.7)" }}>
      <Center>
        <div>
          <div style={{ fontWeight: "bold", fontSize: "2em" }}>
            The network host is not online
          </div>

          <p>Once the host connects, the call will automatically start.</p>

          <p style={{ opacity: 0.5 }}>
            realm: {realmId}
            <br />
            channel: {channelId}
          </p>

          <hr />

          <p>Either continue waiting, or</p>
          <button
            onClick={() => openRoute(ROUTE_CALL_DISCONNECT)}
            style={{
              backgroundColor: "rgb(52, 127, 232)",
              color: "#fff",
              marginTop: 8,
            }}
          >
            Choose a different network
          </button>
        </div>
        {/*
      // TODO: Implement
      <div>
        <button>Cancel</button>
      </div>
      */}
      </Center>
    </Cover>
  ) : null;
}
