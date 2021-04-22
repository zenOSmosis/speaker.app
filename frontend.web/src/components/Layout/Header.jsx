import React from "react";
import classNames from "classnames";
import styles from "./Layout.module.css";

export default function Header({ className, children, ...rest }) {
  return (
    <div {...rest} className={classNames(styles["header"], className)}>
      {children}
    </div>
  );
}
