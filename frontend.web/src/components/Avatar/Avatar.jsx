import React, { useMemo } from "react";

import classNames from "classnames";
import styles from "./Avatar.module.css";

import PropTypes from "prop-types";

Avatar.propTypes = {
  // NOTE (jh): This was added for consistency between image and font-based avatars
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default function Avatar({
  className,
  src,
  name,
  description,
  onEl,
  style = {},
  size,
  ...rest
}) {
  const title = useMemo(
    () => `${name}${description && ` | ${description}`}`,
    [name, description]
  );

  if (src) {
    return (
      <img
        ref={onEl}
        className={classNames(styles["avatar"], className)}
        style={{ ...style, height: size, width: size }}
        src={src}
        alt={name}
        title={title}
        {...rest}
      />
    );
  } else {
    // TODO: Set dynamic icon if no source (use a question mark?)

    return null;
  }
}
