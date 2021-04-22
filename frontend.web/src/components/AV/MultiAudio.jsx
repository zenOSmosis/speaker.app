import React, { Fragment } from "react";
import Audio from "./Audio";

/**
 * Plays multiple audio MediaStreamTracks out the speakers, without any visuals.
 *
 * @typedef {Object} MultiAudioParams
 * @property {MediaStreamTrack[]} mediaStreamTracks
 *
 * @param {MultiAudioParams} audioParams
 */
export default function MultiAudio({ mediaStreamTracks = [] }) {
  return (
    <Fragment>
      {mediaStreamTracks
        .filter(({ kind }) => kind === "audio")
        .map((mediaStreamTrack) => {
          return (
            <Audio
              key={mediaStreamTrack.id}
              mediaStreamTrack={mediaStreamTrack}
            />
          );
        })}
    </Fragment>
  );
}
