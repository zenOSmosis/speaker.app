import React, { useMemo } from "react";
import SpeakerAppLogoScene from "@components/SpeakerAppLogoScene";
import Cover from "@components/Cover";
import Animation from "@components/Animation";
import Background from "@components/Background";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useSyncObject from "@hooks/useSyncObject";

export default function BackingView() {
  const { isConnected, readOnlySyncObject } = useWebPhantomSessionContext();

  const [readOnlySyncObjectState] = useSyncObject(readOnlySyncObject);

  const backgroundUrl = useMemo(() => {
    const backgroundImage =
      readOnlySyncObject &&
      typeof readOnlySyncObjectState.backgroundImage === "string" &&
      JSON.parse(readOnlySyncObjectState.backgroundImage);

    if (
      backgroundImage &&
      backgroundImage.urls &&
      backgroundImage.urls.regular
    ) {
      return backgroundImage.urls.regular;
    }
  }, [readOnlySyncObjectState]);

  return (
    <Cover style={{ backgroundColor: "rgba(255,255,255,.2)" }}>
      {isConnected && backgroundUrl ? (
        <Animation animationName="fadeIn">
          <Background
            src={backgroundUrl}
            style={{ backgroundColor: "rgba(0,0,0,.2)" }}
          ></Background>
        </Animation>
      ) : (
        <SpeakerAppLogoScene />
      )}
    </Cover>
  );
}
