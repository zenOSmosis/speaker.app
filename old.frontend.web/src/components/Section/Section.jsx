import React from "react";
import classNames from "classnames";

export default function Section({ children, className, ...rest }) {
  return (
    // IMPORTANT: This intentionally uses global "section" CSS styling
    <div {...rest} className={classNames("section", className)}>
      {children}
    </div>
  );
}
