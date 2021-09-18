import React from "react";
import classNames from "classnames";
import styles from "./List.module.css";

export default function List({ className, children, ...rest }) {
  return (
    <ul {...rest} className={classNames(styles["list"], className)}>
      {children}
    </ul>
  );
}
