import React, { useEffect, useState } from "react";
import Section from "@components/Section";
import Timer from "@components/Timer";
import SDPMedia from "./SDPMedia";

import getUptime from "@shared/time/getUptime";

import useClientDeviceContext from "@hooks/useClientDeviceContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useViewportSize from "@hooks/useViewportSize";
import useSocketContext from "@hooks/useSocketContext";

import getIsDevelopmentMode from "@utils/getIsDevelopmentMode";

import { EVT_SDP_OFFERED, EVT_SDP_ANSWERED } from "@src/WebZenRTCPeer";

export default function DebugView() {
  const { historicalSessionCount, coreCount } = useClientDeviceContext();

  const { zenRTCPeer, getClientSessionUptime, latency, isHostOnline } =
    useWebPhantomSessionContext();

  const { getConnectionUptime: getSocketConnectionUptime } = useSocketContext();

  const [sdpOffer, _setSDPOffer] = useState(null);
  const [sdpAnswer, _setSDPAnswer] = useState(null);

  const [viewportSize, _setViewportSize] = useState({ width: 0, height: 0 });
  useViewportSize(_setViewportSize);

  // Handle sync of sdp offer / answer
  useEffect(() => {
    if (zenRTCPeer) {
      const _handleSdpUpdate = () => {
        const sdpOffer = zenRTCPeer.getSdpOffer();
        _setSDPOffer(sdpOffer);

        const sdpAnswer = zenRTCPeer.getSdpAnswer();
        _setSDPAnswer(sdpAnswer);
      };

      // Perform initial sync
      _handleSdpUpdate();

      zenRTCPeer.on(EVT_SDP_OFFERED, _handleSdpUpdate);
      zenRTCPeer.on(EVT_SDP_ANSWERED, _handleSdpUpdate);

      return function unmount() {
        zenRTCPeer.off(EVT_SDP_OFFERED, _handleSdpUpdate);
        zenRTCPeer.off(EVT_SDP_ANSWERED, _handleSdpUpdate);
      };
    }
  }, [zenRTCPeer]);

  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
      <Section>
        <h1>Phantom Client</h1>

        <div>
          UI Uptime: <Timer onTick={getUptime} />
        </div>

        <div>
          Screen Resolution: {viewportSize.width} x {viewportSize.height}
          <br />
          Device Pixel Ratio:{" "}
          {window.devicePixelRatio ? `${window.devicePixelRatio}:1` : "N/A"}
        </div>

        <div>Core Count: {coreCount}</div>

        <div>Historical Session Count: {historicalSessionCount}</div>

        <div>
          {/** @see https://web.dev/origin-agent-cluster */}
          Origin Agent Cluster:{" "}
          {Boolean(window.originAgentCluster) ? "Yes" : "No"}
        </div>

        <div>Build: {process.env.REACT_APP_GIT_HASH}</div>
      </Section>

      <Section>
        <h1>Phantom Session / WebRTC</h1>

        <Section>TODO: Include active transcoding server details</Section>

        <div>Host Online: {isHostOnline ? "Yes" : "No"}</div>

        <div>
          Signaling Connection Uptime: <br />
          <Timer onTick={getSocketConnectionUptime} />
        </div>

        <div>
          WebRTC Connection Uptime: <br />
          <Timer onTick={getClientSessionUptime} />
        </div>

        <div>WebRTC Latency: {latency.toFixed(2)} ms</div>

        <Section>
          <h2>Offer Media</h2>

          <SDPMedia sdp={sdpOffer} />
        </Section>

        <Section>
          <h2>Answer Media</h2>

          <SDPMedia sdp={sdpAnswer} />
        </Section>
      </Section>

      {getIsDevelopmentMode() && (
        <Section>
          <h2>Misc.</h2>

          <div style={{ margin: 8 }}>
            {
              // TODO: Remove or refactor
            }
            <button
              onClick={() => {
                const dataChannel = zenRTCPeer.createDataChannel("test");

                // TODO: Remove
                console.log({
                  dataChannel,
                  send: dataChannel.send,
                });
                dataChannel.send("hello there");
              }}
              disabled={!zenRTCPeer}
            >
              Create Test Data Channel
            </button>
          </div>

          <div>
            <button
              onClick={() =>
                window.confirm("Exit the app and reload?") &&
                window.location.reload(true)
              }
              style={{ backgroundColor: "red" }}
            >
              Reload App
            </button>
          </div>
        </Section>
      )}
    </div>
  );
}
