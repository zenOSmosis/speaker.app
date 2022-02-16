import React from "react";
import styles from "./LED.module.css";
import classNames from "classnames";
import PropTypes from "prop-types";

LED.propTypes = {
  /** The color of the LED */
  color: PropTypes.string,
};

/**
 * @see https://github.com/aus/led.css
 * @see http://jsfiddle.net/XrHcA/
 */
export default function LED({ color = null, ...rest }) {
  return (
    <div {...rest} className={classNames(styles["led"], styles[color])}></div>
  );
}
