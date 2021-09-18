import React from "react";
import classNames from "classnames";
import styles from "./LCD.module.css";

// @see https://github.com/s-a/digital-numbers-font
export default function LCD({ children, className, ...rest }) {
  // TODO: Convert style to inheritable classes, etc.
  return (
    <div {...rest} className={classNames([styles["lcd"], className])}>
      {children}
    </div>
  );
}
