import React, { useState } from "react";
import useChromeRTCSession from "./hooks/useChromeRTCSession";
import "./PhantomServerDebugger.module.css";

// TODO: Don't render this unless the user explicitly wants it rendered (save
// CPU / memory on server)
export default function PhantomServerDebugger() {
  const { zenRTCPeers } = useChromeRTCSession();

  const [reloadTime, setReloadTime] = useState(0);

  return (
    <div key={reloadTime}>
      <h1>Phantom Server Debugger</h1>

      <button onClick={() => setReloadTime(new Date().getTime())}>
        Reload
      </button>

      <div>
        <h2>Connected Peers ({zenRTCPeers.length})</h2>
        <div>
          {zenRTCPeers.map((peer, idx) => {
            // TODO: Remove
            console.debug({
              peer,
              incomingMediaStreamTracks: peer.getIncomingMediaStreamTracks(),
              outgoingMediaStreamTracks: peer.getOutgoingMediaStreamTracks(),
            });

            return (
              <div
                key={idx}
                style={{
                  margin: 10,
                  padding: 4,
                  border: "1px #ccc solid",
                  float: "left",
                }}
              >
                <div>idx: {idx}</div>
                <div>Socket IO Id: {peer.getSocketIoId()}</div>
                <div>
                  <h3>Outgoing Media Stream Tracks</h3>
                  <GroupedMediaStreamTracks
                    mediaStreamTracks={peer.getOutgoingMediaStreamTracks()}
                  />
                </div>
                <div>
                  <h3>Incoming Media Stream Tracks</h3>
                  <GroupedMediaStreamTracks
                    mediaStreamTracks={peer.getIncomingMediaStreamTracks()}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GroupedMediaStreamTracks({ mediaStreamTracks }) {
  const audioTracks = mediaStreamTracks.filter(({ kind }) => kind === "audio");
  const videoTracks = mediaStreamTracks.filter(({ kind }) => kind === "video");

  return (
    <div>
      <div>
        <h4>Audio Tracks ({audioTracks.length})</h4>
        {audioTracks.map(({ id }) => (
          <div key={id}>{id}</div>
        ))}
      </div>
      <div>
        <h4>Video Tracks ({videoTracks.length})</h4>
        {videoTracks.map(({ id }) => (
          <div key={id}>{id}</div>
        ))}
      </div>
    </div>
  );
}
