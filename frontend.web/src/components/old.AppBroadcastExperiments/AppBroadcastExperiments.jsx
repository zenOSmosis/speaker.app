import React, { useEffect, useMemo, useState } from "react";
import Layout, { Header, Content } from "../Layout";
import JSNESStreamer from "./JSNESStreamer";
import ScreenCapture from "./ScreenCapture";
import HowlerAudio from "./HowlerAudio";
import FullViewport from "../FullViewport";

export default function AppBroadcastExperiments({
  zenRTCPeer,
  isZenRTCConnected,
  ...rest
}) {
  useEffect(() => {
    // TODO: Move override elsewhere
    if (zenRTCPeer) {
      zenRTCPeer.captureUserMedia = () => null;
    }
  }, [zenRTCPeer]);

  const [selectedExperiment, setSelectedExperiment] = useState(null);

  const experimentViews = useMemo(
    () => ({
      screenCapture: ({ ...rest }) => <ScreenCapture {...rest} />,
      jsNesStreamer: ({ ...rest }) => <JSNESStreamer {...rest} />,
      howlerAudio: ({ ...rest }) => <HowlerAudio {...rest} />,
    }),
    []
  );

  const ExperimentView = useMemo(() => experimentViews[selectedExperiment], [
    selectedExperiment,
    experimentViews,
  ]);

  return (
    <FullViewport style={{ fontSize: 14 }}>
      <Layout>
        <Header style={{ borderBottom: "1px #ccc solid" }}>
          <h1>App Broadcast Experiments</h1>
          {!isZenRTCConnected && selectedExperiment && (
            <button onClick={() => zenRTCPeer.connect()}>Connect</button>
          )}

          {!selectedExperiment && (
            <select onChange={(evt) => setSelectedExperiment(evt.target.value)}>
              <option value="">Select experiment</option>
              {Object.keys(experimentViews).map((key, idx) => (
                <option key={idx} value={key}>
                  {key}
                </option>
              ))}
            </select>
          )}

          <button
            style={{ float: "right" }}
            onClick={() => window.location.reload()}
          >
            Restart
          </button>
        </Header>
        <Content>
          {selectedExperiment && (
            <ExperimentView
              zenRTCPeer={zenRTCPeer}
              isZenRTCConnected={isZenRTCConnected}
              {...rest}
            />
          )}
        </Content>
      </Layout>
    </FullViewport>
  );
}
