import React, { useEffect, useState } from "react";
import AudioLevelMeter from "./AudioLevelMeter";
import {
  AudioMediaStreamTrackLevelMonitor,
  AudioMediaStreamTrackLevelMonitorEvents,
} from "media-stream-track-controller";

const { EVT_AUDIO_LEVEL_TICK } = AudioMediaStreamTrackLevelMonitorEvents;

export default function AudioMediaStreamTrackLevelMeter({
  mediaStreamTrack,
  ...rest
}) {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    if (mediaStreamTrack) {
      const mediaStreamMonitor = new AudioMediaStreamTrackLevelMonitor(
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
    } else {
      setPercent(0);
    }
  }, [mediaStreamTrack]);

  return <AudioLevelMeter percent={percent} {...rest} />;
}
