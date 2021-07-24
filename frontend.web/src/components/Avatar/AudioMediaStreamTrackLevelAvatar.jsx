import React, { useEffect, useState } from "react";
import Avatar from "../Avatar";

import {
  AudioMediaStreamTrackLevelMonitor,
  AudioMediaStreamTrackLevelMonitorEvents,
} from "media-stream-track-controller";

import getPercentColor from "@shared/string/getPercentColor";

const { EVT_AUDIO_LEVEL_TICK } = AudioMediaStreamTrackLevelMonitorEvents;

export default function AudioMediaStreamTrackLevelAvatar({
  mediaStreamTrack,
  ...rest
}) {
  const [avatarEl, setAvatarEl] = useState(null);

  useEffect(() => {
    if (avatarEl && mediaStreamTrack) {
      const mediaStreamMonitor = new AudioMediaStreamTrackLevelMonitor(
        mediaStreamTrack
      );

      mediaStreamMonitor.on(EVT_AUDIO_LEVEL_TICK, ({ rms }) => {
        // FIXME: This is probably not supposed to be RMS, but it's close
        // enough for prototyping
        avatarEl.style.borderColor = getPercentColor(rms / 100 / 1.5);
      });

      return function unmount() {
        mediaStreamMonitor.destroy();
      };
    }
  }, [avatarEl, mediaStreamTrack]);

  return <Avatar {...rest} onEl={setAvatarEl} />;
}
