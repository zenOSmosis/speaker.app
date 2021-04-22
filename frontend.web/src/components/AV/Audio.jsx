import React from "react";
import AVBase from "./AVBase";

/**
 * Plays a single audio MediaStreamTrack out the speakers, without any visuals.
 */
export default function Audio({ ...rest }) {
  return (
    <AVBase
      {...rest}
      mediaType="audio"
      style={{ opacity: 0 }} // TODO: Use class instead of style
    />
  );
}
