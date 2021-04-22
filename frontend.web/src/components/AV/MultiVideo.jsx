import React, { useMemo } from "react";
import Video from "./Video";

/**
 * Plays multiple video MediaStreamTracks, as a single overlay (latest added
 * takes precedence).
 *
 * @typedef {Object} MultiVideoParams
 * @property {MediaStreamTrack[]} mediaStreamTracks
 *
 * @param {MultiVideoParams} videoParams
 */
export default function MultiVideo({ mediaStreamTracks = [] }) {
  const videoMediaStreamTracks = useMemo(
    () => mediaStreamTracks.filter(({ kind }) => kind === "video"),
    [mediaStreamTracks]
  );

  const displayMediaStreamTrack = useMemo(
    () => videoMediaStreamTracks.length && videoMediaStreamTracks[0],
    [videoMediaStreamTracks]
  );

  return <Video mediaStreamTrack={displayMediaStreamTrack} />;
}
