import React, { useCallback, useMemo, useState } from "react";

import { AudioMediaStreamTrackLevelAvatar } from "@components/Avatar";
import Animation from "@components/Animation";
import ButtonTransparent from "@components/ButtonTransparent";

import useAppLayoutContext from "@hooks/useAppLayoutContext";
import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useViewportSize from "@hooks/useViewportSize";

export const HORIZONTAL_ORIENTATION = "horizontal";
export const VERTICAL_ORIENTATION = "vertical";

export default function PanelParticipantsScroller({ orientation }) {
  const { participants } = useWebPhantomSessionContext();

  const [viewableOrientation, setViewableOrientation] = useState(null);

  const { openProfile } = useAppLayoutContext();

  useViewportSize(({ width, height }) => {
    const newViewableOrientation =
      width > height ? HORIZONTAL_ORIENTATION : VERTICAL_ORIENTATION;

    if (newViewableOrientation !== viewableOrientation) {
      setViewableOrientation(newViewableOrientation);
    }
  });

  if (viewableOrientation !== orientation) {
    return null;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflowY: orientation === VERTICAL_ORIENTATION ? "auto" : "hidden",
        overflowX: orientation === HORIZONTAL_ORIENTATION ? "auto" : "hidden",
        textAlign: "left",
      }}
    >
      {participants
        .filter(participant => !participant.isLocal)
        .map(participant => (
          <Participant
            key={participant.socketIoId}
            participant={participant}
            onClick={openProfile}
          />
        ))}
    </div>
  );
}

function Participant({ participant, onClick }) {
  const audioMediaStreamTrack = useMemo(
    () => participant.mediaStreamTracks.find(track => track.kind === "audio"),
    [participant]
  );

  const handleClick = useCallback(
    () => onClick(participant),
    [onClick, participant]
  );

  return (
    <ButtonTransparent
      onClick={handleClick}
      style={{
        display: "inline-block",
        padding: 0,
        margin: 0,
      }}
    >
      <Animation animationName="flipInX">
        <AudioMediaStreamTrackLevelAvatar
          key={participant.socketIoId}
          mediaStreamTrack={audioMediaStreamTrack}
          src={participant.avatarURL}
          name={participant.name}
          description={participant.description}
          size={50}
          style={{
            borderWidth: 4,
          }}
        />
      </Animation>
    </ButtonTransparent>
  );
}
