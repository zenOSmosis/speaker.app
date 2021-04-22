import React from "react";
import classNames from "classnames";

import styles from "./Orbitron.module.css";

// @see https://fonts.googleapis.com/css?family=Orbitron
export default function Orbitron({ children, className, ...rest }) {
  // TODO: Convert style to inheritable classes, etc.
  return (
    <div {...rest} className={classNames([styles["orbitron"], className])}>
      {children}
    </div>
  );
}
