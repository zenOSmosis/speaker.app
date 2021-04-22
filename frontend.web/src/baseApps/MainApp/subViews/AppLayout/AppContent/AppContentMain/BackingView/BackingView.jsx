import React from "react";
import SpeakerAppLogoScene from "@components/SpeakerAppLogoScene";
import Cover from "@components/Cover";
import Animation from "@components/Animation";
import Background from "@components/Background";

import useWebPhantomSessionContext from "@hooks/useWebPhantomSessionContext";
import useSyncObject from "@hooks/useSyncObject";

export default function BackingView() {
  const { isConnected, readOnlySyncObject } = useWebPhantomSessionContext();

  const [readOnlySyncObjectState] = useSyncObject(readOnlySyncObject);

  return (
    <Cover style={{ backgroundColor: "rgba(255,255,255,.2)" }}>
      {isConnected &&
      readOnlySyncObjectState &&
      readOnlySyncObjectState.backgroundImage &&
      readOnlySyncObjectState.backgroundImage.urls &&
      readOnlySyncObjectState.backgroundImage.urls.regular ? (
        <Animation animationName="fadeIn">
          <Background
            src={readOnlySyncObjectState.backgroundImage.urls.regular}
            style={{ backgroundColor: "rgba(0,0,0,.2)" }}
          ></Background>
        </Animation>
      ) : (
        <SpeakerAppLogoScene />
      )}
    </Cover>
  );
}
