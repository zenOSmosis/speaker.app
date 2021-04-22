import React from "react";
import Layout, { Header, Content } from "@components/Layout";
import Full from "@components/Full";

import AudioInputDeviceSelector from "./AudioInputDeviceSelector";

// TODO: Implement settings for
// - echoCancellation
// - noiseSuppression

export default function Settings() {
  return (
    <Full style={{ padding: 8 }}>
      <Layout>
        <Header style={{ textAlign: "left" }}>
          <h1>Default Audio Input Device</h1>
          <p>Choose default audio device when starting new calls.</p>
          <p>
            Default audio device selection may not persist accurately when
            starting new sessions.
          </p>
        </Header>
        <Content>
          <AudioInputDeviceSelector />
        </Content>
      </Layout>
    </Full>
  );
}
