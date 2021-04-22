import React, { useMemo } from "react";
import classNames from "classnames";
import styles from "./AudioLevelMeter.module.css";

/**
 * Note: This component can render multiple audio levels together as a single unit, side-by-side.
 *
 * @see https://codepen.io/snart1/pen/rRvwwr
 */
export default function AudioLevelMeter({
  className,
  percent,
  percents = [],
  ...rest
}) {
  const renderedLevels = useMemo(() => {
    let renderedLevels = [...percents];

    if (typeof percent !== "undefined") {
      renderedLevels.push(percent);
    }

    renderedLevels = renderedLevels.map((level) => 100 - level);

    return renderedLevels;
  }, [percent, percents]);

  return (
    <div className={classNames(styles["levels"], className)} {...rest}>
      {renderedLevels.map((percent, idx) => (
        <div key={idx} className={styles["level-container"]}>
          <div
            className={styles["level"]}
            style={{
              clipPath: `inset(${percent}% 0 0 0)`,
              WebkitClipPath: `inset(${percent}% 0 0 0)`,
            }}
          ></div>
        </div>
      ))}
    </div>
  );
}
