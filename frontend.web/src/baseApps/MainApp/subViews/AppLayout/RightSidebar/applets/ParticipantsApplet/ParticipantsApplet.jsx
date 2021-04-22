import React from "react";
// import Center from "@components/Center";
// import { MediaStreamTrackAudioLevelMeter } from "@components/AudioLevelMeter";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";

export default function ParticipantsApplet() {
  const { participants } = useWebPhantomSessionContext();

  return (
    <div style={{ width: "100%", height: "100%", overflowY: "auto" }}>
      {participants
        .sort((a, b) => (!a.isLocal && !b.isLocal ? 0 : b.isLocal ? -1 : 1))
        .map((participant) => {
          const {
            socketIoId,
            avatarURL,
            name,
            description,
            isLocal,
            mediaStreamTracks,
          } = participant;

          const audioMediaStreamTracks = [];
          const videoMediaStreamTracks = [];

          for (const track of mediaStreamTracks) {
            switch (track.kind) {
              case "audio":
                audioMediaStreamTracks.push(track);
                break;

              case "video":
                videoMediaStreamTracks.push(track);
                break;

              default:
                break;
            }
          }

          return (
            <div
              key={socketIoId}
              style={{ padding: 8, border: "1px #ccc solid", overflow: "auto" }}
              title={description}
            >
              <img
                src={avatarURL}
                alt={name}
                style={{
                  float: "left",
                  width: 100,
                  height: 100,
                  border: "4px #ccc solid",
                  borderRadius: 100,
                }}
              />

              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "1.2rem",
                  marginBottom: 4,
                }}
              >
                {name}
              </div>

              <div>
                a: {audioMediaStreamTracks.length} / v:{" "}
                {videoMediaStreamTracks.length}
              </div>

              <div>Local? {isLocal ? "yes" : "no"}</div>
            </div>
          );
        })}
    </div>
  );
}
