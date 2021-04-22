import React, { useMemo } from "react";
import { FileIcon as ReactFileIcon, defaultStyles } from "react-file-icon";

import PropTypes from "prop-types";

FileIcon.propTypes = {
  filename: PropTypes.string.isRequired,

  type: PropTypes.oneOf([
    "3d",
    "acrobat",
    "audio",
    "binary",
    "code",
    "compressed",
    "document",
    "drive",
    "font",
    "image",
    "presentation",
    "settings",
    "spreadsheet",
    "vector",
    "video",
  ]),
};

export default function FileIcon({ filename, type = null, ...rest }) {
  const extension = useMemo(() => {
    const parts = filename.split(".");

    return parts[parts.length - 1];
  }, [filename]);

  return (
    <div {...rest}>
      <ReactFileIcon
        extension={extension}
        type={type}
        {...defaultStyles[extension]}
      />
    </div>
  );
}
