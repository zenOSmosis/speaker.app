import React from "react";
import styles from "./HAL9000.module.css";
import classNames from "classnames";

// @see https://codepen.io/giana/pen/XmjOBG
export default function HAL9000({ className, ...rest }) {
  return (
    <div className={classNames(styles["hal"], className)} {...rest}>
      <div className={styles["panel"]}>
        <div className={styles["base"]}>
          <div className={styles["lens"]}>
            <div className={styles["reflections"]}></div>
          </div>
          <div className={styles["animation"]}></div>
        </div>
      </div>
    </div>
  );
}
