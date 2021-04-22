import React from "react";
import classNames from "classnames";
import styles from "./Twobit.module.css";

// @see https://www.ffonts.net/Twobit.font
export default function Twobit({ children, className, ...rest }) {
  // TODO: Convert style to inheritable classes, etc.
  return (
    <div {...rest} className={classNames([styles["twobit"], className])}>
      {children}
    </div>
  );
}
