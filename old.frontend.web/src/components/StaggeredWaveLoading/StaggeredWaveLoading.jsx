import React from "react";
import styles from "./StaggeredWaveLoading.module.css";

// @see https://codepen.io/alphardex/pen/XWWWBmQ
export default function StaggeredWaveLoading({ ...rest }) {
  return (
    <div className={styles["loading-wrapper"]} {...rest}>
      <div className={styles["loading"]}>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
        <div className={styles["dot"]}></div>
      </div>
    </div>
  );
}
