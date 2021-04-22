import React from "react";
import classNames from "classnames";
import styles from "./StackingContext.module.css";

const StackingContext = ({ className, children, ...propsRest }) => {
  return (
    <div
      {...propsRest}
      className={classNames(styles["stacking-context"], className)}
    >
      {children}
    </div>
  );
};

export default StackingContext;
