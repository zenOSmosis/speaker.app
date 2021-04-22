import React, { useEffect, useState } from "react";
import QRCodeLib from "qrcode";

import PropTypes from "prop-types";

QRCode.propTypes = {
  /** The QR code value */
  value: PropTypes.string.isRequired,

  /** The pixel width / height; default is 320 */
  size: PropTypes.number,
};

export default function QRCode({ value, size = 320, margin = 2, ...rest }) {
  const [elCanvas, _setElCanvas] = useState(null);
  const [error, _setError] = useState(null);

  useEffect(() => {
    if (elCanvas) {
      QRCodeLib.toCanvas(
        elCanvas,
        value,
        {
          width: size,
          margin,
          ...rest,
        },
        (err) => {
          if (err) {
            console.warn("Caught:", err);

            _setError(error);
          }
        }
      );
    }
  }, [elCanvas, value, margin, size, error, rest]);

  if (error) {
    return <div>Unable to render</div>;
  }

  return <canvas ref={_setElCanvas} width={size} height={size}></canvas>;
}
