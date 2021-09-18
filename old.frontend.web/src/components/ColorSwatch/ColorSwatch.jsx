import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./ColorSwatch.module.css";

ColorSwatch.propTypes = {
  color: PropTypes.string,
};

export default function ColorSwatch({
  color = "gray",
  className,
  styles: stylesProp,
  ...rest
}) {
  return (
    <div
      {...rest}
      className={classNames(styles["color-swatch"], className)}
      style={{
        ...stylesProp,
        backgroundColor: color,
      }}
    ></div>
  );
}
