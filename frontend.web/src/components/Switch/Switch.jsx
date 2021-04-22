import React, { useMemo } from "react";
import classNames from "classnames";
import styles from "./Switch.module.css";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

Switch.propTypes = {
  onChange: PropTypes.func,

  isOn: PropTypes.bool,

  disabled: PropTypes.bool,
};

export default function Switch({
  className,
  onChange = () => null,
  isOn,
  disabled,
  ...rest
}) {
  const domId = useMemo(uuidv4, []);

  return (
    <div
      className={classNames(
        styles["switch-wrapper"],
        disabled && styles["disabled"],
        className
      )}
      {...rest}
    >
      <input
        type="checkbox"
        id={domId}
        className={styles["checkbox"]}
        checked={isOn}
        onChange={(evt) => onChange(evt.target.checked)}
        disabled={disabled}
      />
      <label htmlFor={domId} className={styles["switch"]}></label>
    </div>
  );
}
