import React, { useState } from "react";

import classNames from "classnames";
import styles from "./Center.module.css";

import useOverflowDetection from "@hooks/useOverflowDetection";

import PropTypes from "prop-types";

Center.propTypes = {
  /**
   * Whether or not content can overflow when the Center content overflows it
   * outer wrapper.
   */
  canOverflow: PropTypes.bool,
};

export default function Center({
  children,
  className,
  canOverflow = false,
  ...propsRest
}) {
  const [centerEl, _setCenterEl] = useState(null);

  const isOverflown = useOverflowDetection(centerEl, canOverflow);

  if (canOverflow && isOverflown) {
    // Display without centering
    return (
      <div
        ref={_setCenterEl}
        className={classNames(
          styles["non-center"],
          canOverflow ? styles["can-overflow"] : null,
          className
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      ref={_setCenterEl}
      {...propsRest}
      className={classNames(styles["center"], className)}
    >
      {
        // TODO: Once overflowed container, don't keep stretching
      }
      <div className={styles["inner-wrap"]}>{children}</div>
    </div>
  );
}
