import React, { useMemo } from "react";

import classNames from "classnames";
import styles from "./SignalStrengthIndicator.module.css";

// @see https://codepen.io/paulmerupu91/pen/LevMgR
export default function SignalStrengthIndicator({
  className,
  signalStrength,
  ...rest
}) {
  const classThresholds = useMemo(
    () => [
      {
        className: "full",
        minSignalStrength: 1,
      },
      {
        className: "three-quarters",
        minSignalStrength: 0.75,
      },
      {
        className: "half",
        minSignalStrength: 0.5,
      },
      {
        className: "one-quarter",
        minSignalStrength: 0.25,
      },
    ],
    []
  );

  return (
    <div
      {...rest}
      className={classNames(styles["signal-strength-indicator"], className)}
    >
      {classThresholds.map(({ className, minSignalStrength }, idx) => (
        <div
          key={idx}
          className={classNames(
            styles["curve"],
            styles[className],
            signalStrength >= minSignalStrength && styles["active"]
          )}
        />
      ))}
    </div>
  );
}
