import React from "react";
import classNames from "classnames";
import styles from "./ButtonTransparent.module.css";

function ButtonTransparent({ children, className, ...rest }) {
  return (
    <button
      className={classNames(styles["button-transparent"], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export default ButtonTransparent;
