import React, { useState } from "react";
import Avatar from "../Avatar";

import PropTypes from "prop-types";

import useAudioMediaStreamTrackLevelMonitor from "@hooks/useAudioMediaStreamTrackLevelMonitor";

import getPercentColor from "@shared/string/getPercentColor";

AudioMediaStreamTrackLevelAvatar.propTypes = {
  /** When multiple audio tracks may be used together */
  mediaStreamTracks: PropTypes.arrayOf(PropTypes.instanceOf(MediaStreamTrack)),

  /** When only a single track is used */
  mediaStreamTrack: PropTypes.instanceOf(MediaStreamTrack),
};

export default function AudioMediaStreamTrackLevelAvatar({
  mediaStreamTracks,
  mediaStreamTrack,
  ...rest
}) {
  const [avatarEl, setAvatarEl] = useState(null);

  /*
  const percent = useAudioMediaStreamTrackLevelMonitor(
    mediaStreamTrack || mediaStreamTracks
  );
  */
  const percent = 0;

  if (avatarEl) {
    avatarEl.style.borderColor = getPercentColor(percent);
  }

  return <Avatar {...rest} onEl={setAvatarEl} />;
}
