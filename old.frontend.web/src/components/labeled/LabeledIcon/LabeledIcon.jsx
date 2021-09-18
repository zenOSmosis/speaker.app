import React from "react";
import ButtonTransparent from "@components/ButtonTransparent";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./LabeledIcon.module.css";

LabeledIcon.propTypes = {
  label: PropTypes.string.isRequired,

  /** The color of the LED */
  color: PropTypes.string,

  /** The icon (i.e. SettingsIcon [represents <SettingsIcon />]) */
  icon: PropTypes.func.isRequired,
};

export default function LabeledIcon({
  color,
  className,
  style,
  label,
  icon,
  ...rest
}) {
  const Icon = icon;

  return (
    <ButtonTransparent
      className={classNames(styles["labeled-icon"], className)}
      style={style}
      {...rest}
    >
      <div className={styles["icon-wrap"]}>
        <Icon className={styles["icon"]} color={color} />
      </div>
      <div className={styles["label-wrap"]}>{label}</div>
    </ButtonTransparent>
  );
}
