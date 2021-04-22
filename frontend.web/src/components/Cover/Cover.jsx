import React from "react";
import Full from "../Full";
import classNames from "classnames";
import styles from "./Cover.module.css";

export default React.forwardRef(function Cover(
  { isVisible = true, children, className, ...rest },
  forwardedRef
) {
  return (
    <Full
      ref={forwardedRef}
      {...rest}
      className={classNames(
        styles["cover"],
        !isVisible ? styles["no-display"] : ""
      )}
    >
      {children}
    </Full>
  );
});
