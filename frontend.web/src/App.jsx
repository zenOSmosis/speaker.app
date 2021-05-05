import React, { useMemo, Suspense } from "react";
import Center from "@components/Center";
import FullViewport from "@components/FullViewport";
import Layout, { Content, Footer } from "@components/Layout";
import ErrorBoundary from "@components/ErrorBoundary";

import { BrowserRouter as Router } from "react-router-dom";
import { useLocation } from "react-router";

import SocketProvider from "@providers/SocketProvider";
import ClientDeviceProvider from "@providers/ClientDeviceProvider";

import "./css";

/**
 * Common code between the main app, and in-browser transcoder server app.
 *
 * It is important to keep this code to a bare minimal, meeting only the
 * baseline essentials.
 *
 * Lazy loading is utilized in order to load the additional dependencies once a
 * particular sub-app (i.e. "main app" or "transcoder app") is chosen to run.
 */
export default function SplitApp() {
  return (
    <Router>
      <FullViewport>
        <ErrorBoundary>
          <SocketProvider>
            <ClientDeviceProvider>
              <SplitAppView />
            </ClientDeviceProvider>
          </SocketProvider>
        </ErrorBoundary>
      </FullViewport>
    </Router>
  );
}

function SplitAppView() {
  const location = useLocation();

  const MainApp = useMemo(
    () => React.lazy(() => import("./baseApps/MainApp")),
    []
  );
  const TranscoderApp = useMemo(
    () => React.lazy(() => import("./baseApps/TranscoderApp")),
    []
  );

  // Jest tests do not work well with the rendered component
  //
  // FIXME: Every other component needs to be tested in isolation
  if (process.env.JEST_WORKER_ID !== undefined) {
    return null;
  }

  // TODO: Force reload if jumping Main / Transcoder boundaries in same single-page session in order to unload modules

  if (location.pathname === "/server") {
    // Transcoder server
    return (
      <Suspense
        fallback={<Center>Loading Speaker.app Transcoder Engine</Center>}
      >
        <TranscoderApp />
      </Suspense>
    );
  } else {
    // Regular web client
    return (
      <Suspense
        fallback={
          <Layout>
            <Content>
              <Center style={{ fontSize: "2rem", fontWeight: "bold" }}>
                <div>Setting up...</div>
              </Center>
            </Content>
            <Footer className="note" style={{ textAlign: "right", padding: 8 }}>
              Speaker.app build {process.env.REACT_APP_GIT_HASH}
            </Footer>
          </Layout>
        }
      >
        <MainApp />
      </Suspense>
    );
  }
}
