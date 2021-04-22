import React from "react";
import classNames from "classnames";
import styles from "./List.module.css";

export default function ListItem({ className, children, ...rest }) {
  return (
    <li {...rest} className={classNames(styles["item"], className)}>
      {children}
    </li>
  );
}
