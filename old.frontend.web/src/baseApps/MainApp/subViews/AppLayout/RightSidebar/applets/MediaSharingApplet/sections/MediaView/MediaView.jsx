import React, { useCallback } from "react";
import Section from "@components/Section";
import { AudioMediaStreamTrackLevelVUMeter } from "@components/VUMeter";
// import MediaStreamAudioController from "@shared/audio/MediaStreamAudioController";
import LED from "@components/LED";
import { Video } from "@components/AV";

import PlayIcon from "@icons/PlayIcon";
import PauseIcon from "@icons/PauseIcon";

import useSharedFilesContext from "@hooks/useSharedFilesContext";

export default function MediaView() {
  // TODO: Use?
  const getAudioMediaStreamTracks = useCallback(() => {
    let ret = [];

    /*
    if (persistenceView) {
      // const audioController = persistenceView.getMediaStreamAudioController();

      // if (audioController && audioController.getIsReady()) {
      // ret = audioController.getOutputMediaStreamAudioTracks();
      // }

      const mediaStream = persistenceView.getMediaStream();

      if (mediaStream) {
        ret = mediaStream.getAudioTracks();
      }
    }
  
    */

    return ret;
  }, []);

  const { openedSharedFiles } = useSharedFilesContext();

  // TODO: If no shared files, gray this out like TensorFlow applet disabled sections
  // Make a disabled property on section...?

  return (
    <Section>
      <h1 style={{ color: "gray" }}>Media View</h1>

      {
        // TODO: Remove
      }
      <div>{openedSharedFiles.length}</div>

      <button disabled>
        Play on Background <LED color="gray" />
      </button>

      <div style={{ marginTop: 10 }}>
        <div>
          <Video />
          <div>
            <button
              style={{ margin: 2 }}
              onClick={
                () => null /* persistenceView && persistenceView.play() */
              }
              disabled
            >
              <PlayIcon style={{ fontSize: "2rem" }} />
            </button>
            <button
              style={{ margin: 2 }}
              onClick={
                () => null /* persistenceView && persistenceView.pause() */
              }
              disabled
            >
              <PauseIcon style={{ fontSize: "2rem" }} />
            </button>
          </div>
        </div>
      </div>

      <div>
        {
          // TODO: Pipe audio streams here
        }
        {getAudioMediaStreamTracks().map((mediaStreamTrack, idx) => (
          <AudioMediaStreamTrackLevelVUMeter
            key={idx}
            mediaStreamTrack={mediaStreamTrack}
          />
        ))}
      </div>
    </Section>
  );
}
