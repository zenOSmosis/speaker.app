import React, { useCallback } from "react";
import { AudioMediaStreamTrackLevelAvatar } from "../Avatar";
import Center from "../Center";
import Cover from "../Cover";
import ButtonTransparent from "../ButtonTransparent";
import { AudioMediaStreamTrackLevelMeter } from "../AudioLevelMeter";

import useAppLayoutContext from "@hooks/useAppLayoutContext";

// TODO: Refactor and use prop-types
export default function Participant({ participant }) {
  const { openProfile } = useAppLayoutContext();

  const { avatarURL, isMuted, mediaStreamTracks, name, description } =
    participant;

  const isLocal = participant.isLocal;

  const handleOpenParticipant = useCallback(() => {
    openProfile(!participant.isLocal ? participant : null);
  }, [openProfile, participant]);

  return (
    <div
      style={{
        width: 280,
        height: 280,
        border: "1px #ccc solid",
        display: "inline-block",
        borderRadius: 8,
        backgroundColor: "#010101",
        margin: 5,
      }}
    >
      <ButtonTransparent
        style={{ width: "100%", height: "100%" }}
        onClick={handleOpenParticipant}
      >
        <Cover title={description}>
          <div style={{ position: "absolute", top: 4, left: 4 }}>
            {isLocal && "You"}
          </div>
          <div style={{ position: "absolute", top: 4, right: 4 }}>
            {isMuted ? "Muted" : "Unmuted"}
          </div>
          <Center>
            <AudioMediaStreamTrackLevelAvatar
              src={avatarURL}
              size={200}
              style={{ borderWidth: 5 }}
              mediaStreamTracks={mediaStreamTracks}
            />
          </Center>

          <div style={{ position: "absolute", bottom: 2, width: "100%" }}>
            <div style={{ whiteSpace: "no-wrap" }}>{name}</div>
            <div style={{ height: 20, textAlign: "right", paddingRight: 20 }}>
              {mediaStreamTracks.map(track => (
                <AudioMediaStreamTrackLevelMeter
                  key={track.id}
                  mediaStreamTrack={track}
                  style={{ height: 20, width: 10 }}
                />
              ))}
            </div>
          </div>
        </Cover>
      </ButtonTransparent>
    </div>
  );
}
