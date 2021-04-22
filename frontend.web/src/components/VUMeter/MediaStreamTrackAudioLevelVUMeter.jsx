import React, { useEffect, useState } from "react";
import VUMeter from "./VUMeter";
import MediaStreamTrackAudioLevelMonitor, {
  EVT_AUDIO_LEVEL_TICK,
} from "@shared/audio/MediaStreamTrackAudioLevelMonitor";

export default function MediaStreamTrackAudioLevelVUMeter({
  mediaStreamTrack,
  ...rest
}) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (mediaStreamTrack) {
      const mediaStreamMonitor = new MediaStreamTrackAudioLevelMonitor(
        mediaStreamTrack
      );

      mediaStreamMonitor.on(EVT_AUDIO_LEVEL_TICK, ({ rms }) => {
        // FIXME: This is probably not supposed to be RMS, but it's close
        // enough for prototyping
        setPercent(rms);
      });

      return function unmount() {
        mediaStreamMonitor.destroy();
      };
    }
  }, [mediaStreamTrack]);

  return <VUMeter percent={percent} {...rest} />;
}
