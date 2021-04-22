import React, { useEffect, useState } from "react";
import Avatar from "../Avatar";

import MediaStreamTrackAudioLevelMonitor, {
  EVT_AUDIO_LEVEL_TICK,
} from "@shared/audio/MediaStreamTrackAudioLevelMonitor";
import getPercentColor from "@shared/string/getPercentColor";

export default function MediaStreamTrackAudioLevelAvatar({
  mediaStreamTrack,
  ...rest
}) {
  const [avatarEl, setAvatarEl] = useState(null);

  useEffect(() => {
    if (avatarEl && mediaStreamTrack) {
      const mediaStreamMonitor = new MediaStreamTrackAudioLevelMonitor(
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
