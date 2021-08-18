import React from "react";
import VUMeter from "./VUMeter";

import PropTypes from "prop-types";

import useAudioMediaStreamTrackLevelMonitor from "@hooks/useAudioMediaStreamTrackLevelMonitor";

AudioMediaStreamTrackLevelVUMeter.propTypes = {
  /** When multiple audio tracks may be used together */
  mediaStreamTracks: PropTypes.arrayOf(PropTypes.instanceOf(MediaStreamTrack)),

  /** When only a single track is used */
  mediaStreamTrack: PropTypes.instanceOf(MediaStreamTrack),
};

export default function AudioMediaStreamTrackLevelVUMeter({
  mediaStreamTracks,
  mediaStreamTrack,
  ...rest
}) {
  const percent = useAudioMediaStreamTrackLevelMonitor(
    mediaStreamTrack || mediaStreamTracks
  );

  return <VUMeter percent={percent} {...rest} />;
}
