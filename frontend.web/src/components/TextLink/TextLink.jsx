import React from "react";

import PropTypes from "prop-types";

TextLink.propTypes = {
  href: PropTypes.string.isRequired,

  body: PropTypes.string,

  target: PropTypes.string,
};

/**
 * Displays a regular HTML link ("A" tag), using the href as the body, if no
 * body is specified.
 */
export default function TextLink({ href, body, target = "_blank", ...rest }) {
  return (
    <a {...rest} href={href} target={target}>
      {body || href}
    </a>
  );
}
