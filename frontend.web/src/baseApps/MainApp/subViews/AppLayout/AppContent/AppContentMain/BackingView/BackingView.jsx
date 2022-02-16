import React, { useMemo } from "react";
import SpeakerAppLogoScene from "@components/SpeakerAppLogoScene";
import ParticipantsGrid from "@components/ParticipantsGrid";
import Cover from "@components/Cover";
import Animation from "@components/Animation";
import Background from "@components/Background";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useSyncObject from "@hooks/useSyncObject";

export default function BackingView() {
  const { isConnected, readOnlySyncObject } = useWebPhantomSessionContext();

  const [readOnlySyncObjectState] = useSyncObject(readOnlySyncObject);

  const backgroundJSON =
    readOnlySyncObjectState && readOnlySyncObjectState.backgroundImage;

  const backgroundUrl = useMemo(() => {
    const backgroundImage =
      typeof backgroundJSON === "string" && JSON.parse(backgroundJSON);

    if (
      backgroundImage &&
      backgroundImage.urls &&
      backgroundImage.urls.regular
    ) {
      return backgroundImage.urls.regular;
    }
  }, [backgroundJSON]);

  return (
    <Cover style={{ backgroundColor: "rgba(255,255,255,.2)" }}>
      {isConnected && backgroundUrl ? (
        <Animation animationName="fadeIn">
          <Background
            src={backgroundUrl}
            style={{ backgroundColor: "rgba(0,0,0,.2)" }}
          ></Background>
        </Animation>
      ) : !isConnected ? (
        <SpeakerAppLogoScene />
      ) : (
        <ParticipantsGrid />
      )}
    </Cover>
  );
}
