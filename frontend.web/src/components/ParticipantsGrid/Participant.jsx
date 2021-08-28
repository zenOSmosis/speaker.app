import React from "react";
import { AudioMediaStreamTrackLevelAvatar } from "../Avatar";
import ButtonTransparent from "@components/ButtonTransparent";

import useAppLayoutContext from "@hooks/useAppLayoutContext";

export default function Participant({ participant }) {
  const { openProfile } = useAppLayoutContext();

  const { avatarURL, isMuted, mediaStreamTracks, name } = participant;

  const isLocal = participant.isLocal;

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
        onClick={() => openProfile(!participant.isLocal ? participant : null)}
      >
        <div style={{ position: "absolute", top: 4, left: 4 }}>
          {isLocal && "You"}
        </div>
        <div style={{ position: "absolute", top: 4, right: 4 }}>
          {isMuted ? "Muted" : "Unmuted"}
        </div>
        <div>
          <AudioMediaStreamTrackLevelAvatar
            src={avatarURL}
            size={200}
            style={{ borderWidth: 5 }}
            mediaStreamTracks={mediaStreamTracks}
          />
        </div>
        <div>{name}</div>
      </ButtonTransparent>
    </div>
  );
}
