import React, { useState } from "react";
import Center from "@components/Center";
import Section from "@components/Section";

import ParticipantCards from "./ParticipantCards";
import useTranscoderPhantomSessionContext from "../../subHooks/useTranscoderPhantomSessionContext";

export default function LoggedInView() {
  const { realmId, channelId } = useTranscoderPhantomSessionContext();
  const [isControllerUIShowing, setIsControllerUIShowing] = useState(true);

  return isControllerUIShowing ? (
    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
      <Section>
        <h1>
          Currently Serving: {realmId} / {channelId}
        </h1>
        <div style={{ textAlign: "left" }}>
          Controller UI:{" "}
          <button
            disabled={isControllerUIShowing}
            onClick={() => setIsControllerUIShowing(true)}
          >
            Show
          </button>
          <button
            disabled={!isControllerUIShowing}
            onClick={() => setIsControllerUIShowing(false)}
          >
            Hide
          </button>
        </div>
        <div>
          <ParticipantCards />
        </div>

        <div>
          <ul style={{ fontSize: ".8rem" }}>
            <li>TODO: Give share URL / QR code</li>
            <li>TODO: Configure max participants / max A/V streams</li>
            <li>TODO: Choose which clients can see / hear / publish</li>
            <li>TODO: Implement message broadcast</li>
            <li>
              TODO: Implement storage persistence / ability to import / export
              persistence
            </li>
            <li>
              TODO: Implement optional dominant speaker detection (use group
              consensus? Avoid extra load on host server)
            </li>
          </ul>
        </div>
      </Section>
    </div>
  ) : (
    <Center>
      <button
        onClick={() => setIsControllerUIShowing(true)}
        style={{
          fontSize: "1.4rem",
          fontWeight: "bold",
          padding: 24,
          backgroundColor: "rgba(255,255,255,.1)",
        }}
      >
        Open Controller UI
      </button>
    </Center>
  );
}
