import React from "react";
import classNames from "classnames";
import styles from "./Video.module.css";

import AVBase from "./AVBase";

/**
 * Plays a single video MediaStreamTrack out the monitor.
 */
export default function Video({ className, ...rest }) {
  return (
    <AVBase className={classNames(styles["video"], className)} {...rest} />
  );
}
