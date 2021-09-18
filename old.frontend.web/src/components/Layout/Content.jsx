import React from "react";
import classNames from "classnames";
import styles from "./Layout.module.css";

export default function Content({ className, children, ...rest }) {
  return (
    <div {...rest} className={classNames(styles["content"], className)}>
      {children}
    </div>
  );
}
