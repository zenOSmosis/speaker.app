import React from "react";
import Full from "../Full";
import classNames from "classnames";
import PropTypes from "prop-types";
import styles from "./Modal.module.css";

import useKeyboardEvents from "@hooks/useKeyboardEvents";

Modal.propTypes = {
  /** Defaults to true */
  show: PropTypes.bool,
};

// TODO: Bind Escape key to optional onClose

export default function Modal({
  children,
  className,
  onClose = () => null,
  show = true,
  ...rest
}) {
  useKeyboardEvents({
    onKeyDown: (keyCode) => keyCode === 27 && onClose(),
  });

  return (
    <Full
      {...rest}
      className={classNames(styles["modal"], show && styles["show"], className)}
    >
      {children}
    </Full>
  );
}
