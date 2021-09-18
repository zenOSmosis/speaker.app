import React, { useEffect, useMemo, useState } from "react";
import Center from "@components/Center";
import Layout, { Header, Content, Footer } from "@components/Layout";
import Timer from "@components/Timer";

import { EVT_UPDATED } from "@shared/ZenRTCPeer";

import useSyncObject from "@hooks/useSyncObject";

export default function ParticipantCard({ peer }) {
  const readOnlySyncObject = useMemo(() => peer.getReadOnlySyncObject(), [
    peer,
  ]);

  const [latency, setLatency] = useState(0);

  useEffect(() => {
    if (peer) {
      const _handlePeerUpdate = () => {
        setLatency(peer.getLatency());
      };

      peer.on(EVT_UPDATED, _handlePeerUpdate);

      return function unmount() {
        peer.off(EVT_UPDATED, _handlePeerUpdate);
      };
    }
  }, [peer]);

  const [{ name, detectedDevice, isMuted }] = useSyncObject(readOnlySyncObject);

  const incomingMediaStreamTracks = peer.getIncomingMediaStreamTracks();
  const {
    audio: incomingAudioMediaStreamTracks,
    video: incomingVideoMediaStreamTracks,
  } = useMediaStreamTrackTypes(incomingMediaStreamTracks);

  const outgoingMediaStreamTracks = peer.getOutgoingMediaStreamTracks();
  const {
    audio: outgoingAudioMediaStreamTracks,
    video: outgoingVideoMediaStreamTracks,
  } = useMediaStreamTrackTypes(outgoingMediaStreamTracks);

  const socketIoId = peer.getSocketIoId();

  return (
    <div
      key={socketIoId}
      style={{
        margin: 4,
        padding: 4,
        display: "inline-block",
        verticalAlign: "middle",
        backgroundColor: "rgba(255,255,255,.1)",
        border: "2px #999 solid",
        borderRadius: 4,
        width: 300,
        maxWidth: 300,
        height: 200,
        maxHeight: 200,
      }}
    >
      <Layout>
        <Header>
          <div style={{ fontWeight: "bold" }}>{name}</div>
        </Header>
        <Content>
          <Center canOverflow={true}>
            <div style={{ fontSize: ".9em" }}>
              <div
                style={{
                  display: "inline-block",
                  maxWidth: "45%",
                  padding: 4,
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Streams</div>
                <div>
                  <div>
                    in: A {incomingAudioMediaStreamTracks.length} / V{" "}
                    {incomingVideoMediaStreamTracks.length} (
                    {incomingMediaStreamTracks.length})
                  </div>
                  <div>
                    out: A {outgoingAudioMediaStreamTracks.length} / V{" "}
                    {outgoingVideoMediaStreamTracks.length} (
                    {outgoingMediaStreamTracks.length})
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "inline-block",
                  maxWidth: "45%",
                  padding: 4,
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Device</div>
                <div>
                  Type:{" "}
                  {(detectedDevice &&
                    detectedDevice.device &&
                    detectedDevice.device.type) ||
                    "N/A"}
                </div>
                <div>
                  OS:{" "}
                  {detectedDevice &&
                    detectedDevice.os &&
                    detectedDevice.os.name}{" "}
                  {detectedDevice &&
                    detectedDevice.os &&
                    detectedDevice.os.version}{" "}
                  {detectedDevice &&
                    detectedDevice.os &&
                    detectedDevice.os.platform}
                </div>
              </div>

              <div
                style={{
                  display: "inline-block",
                  maxWidth: "45%",
                  padding: 4,
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontWeight: "bold" }}>Network</div>
                <div>Latency: {latency.toFixed(2)}</div>
                <div>
                  Uptime: <Timer onTick={() => peer.getConnectionUptime()} />
                </div>
              </div>
            </div>
          </Center>
        </Content>
        <Footer style={{ overflow: "auto" }}>
          <div
            style={{
              float: "left",
              padding: 4,
              backgroundColor: isMuted ? "red" : "green",
              fontWeight: "bold",
            }}
          >
            {isMuted ? "Muted" : "Unmuted"}
          </div>
          <button onClick={() => peer.kick()} style={{ float: "right" }}>
            Kick
          </button>
        </Footer>
      </Layout>
    </div>
  );
}

function useMediaStreamTrackTypes(mediaStreamTracks = []) {
  const audio = mediaStreamTracks.filter(({ kind }) => kind === "audio");
  const video = mediaStreamTracks.filter(({ kind }) => kind === "video");

  return {
    audio,
    video,
  };
}
