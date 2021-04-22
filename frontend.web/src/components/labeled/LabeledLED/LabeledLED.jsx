import React from "react";
import PropTypes from "prop-types";
import LED from "@components/LED";
import classNames from "classnames";
import styles from "./LabeledLED.module.css";

LabeledLED.propTypes = {
  label: PropTypes.string.isRequired,

  /** The color of the LED */
  color: PropTypes.string,
};

export default function LabeledLED({
  color,
  className,
  style,
  label,
  ...rest
}) {
  return (
    <div className={classNames(styles["labeled-led"], className)} style={style}>
      <div className={styles["led-wrap"]}>
        <LED color={color} {...rest} />
      </div>
      <div className={styles["label-wrap"]}>{label}</div>
    </div>
  );
}
