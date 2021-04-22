import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./LabeledSelect.module.css";

LabeledSelect.propTypes = {
  label: PropTypes.string.isRequired,
};

export default function LabeledSelect({
  children,
  className,
  label,
  disabled,
  ...rest
}) {
  return (
    <div
      className={classNames(
        styles["labeled-select"],
        disabled && styles["disabled"],
        className
      )}
    >
      <div>
        <select {...rest} disabled={disabled}>
          {children}
        </select>
      </div>
      <div className={styles["label-wrap"]}>{label}</div>
    </div>
  );
}
