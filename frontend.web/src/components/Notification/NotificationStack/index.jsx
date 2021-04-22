import React from "react";

import classNames from "classnames";
import styles from "./NotificationStack.module.css";

export default function NotificationStack({ children, className }) {
  return (
    <div className={classNames(styles["notification-stack"], className)}>
      {children}
    </div>
  );
}
