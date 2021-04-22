import React from "react";
import classNames from "classnames";
import styles from "./RowColumn.module.css";
import PropTypes from "prop-types";

// @see https://dev.to/drews256/ridiculously-easy-row-and-column-layouts-with-flexbox-1k01

function Row({ children, className, ...rest }) {
  // TODO: Enforce that only Column components are direct children of this

  return (
    <div {...rest} className={classNames(styles["row"], className)}>
      {children}
    </div>
  );
}

Column.propTypes = {
  isForcedMinWidth: PropTypes.bool,
};

/**
 * Evenly-sized column.
 */
function Column({ children, className, isForcedMinWidth, ...rest }) {
  // TODO: Enforce that only Row component is direct parent of this

  return (
    <div {...rest} className={classNames(styles["column"], className)}>
      {children}
    </div>
  );
}

export { Row, Column };
