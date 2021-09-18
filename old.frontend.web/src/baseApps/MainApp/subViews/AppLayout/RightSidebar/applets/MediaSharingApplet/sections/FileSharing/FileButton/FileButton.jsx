import React from "react";
import ButtonTransparent from "@components/ButtonTransparent";
import Cover from "@components/Cover";
import LED from "@components/LED";
import FileIcon from "@components/icons.nonstandard/FileIcon";
import classNames from "classnames";
import PropTypes from "prop-types";

import styles from "./FileButton.module.css";

import bytesToSize from "@shared/string/bytesToSize";

FileButton.propTypes = {
  file: PropTypes.object.isRequired,

  isOpen: PropTypes.bool.isRequired,

  onClick: PropTypes.func,
};

export default function FileButton({ file, isOpen, onClick }) {
  return (
    <ButtonTransparent
      className={classNames(
        styles["file-button"],
        isOpen ? styles["open"] : null
      )}
      onClick={onClick}
    >
      <Cover style={{ fontSize: ".8em" }}>
        <FileIcon
          filename={file.name}
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            bottom: 14,
            right: 4,
          }}
        />

        <Cover>
          <div
            style={{
              position: "absolute",
              bottom: 64,
              left: 0,
              color: "#000",
              width: "100%",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                width: "90%",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {file.name}
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: 12,
              left: 10,
            }}
          >
            <LED color={isOpen ? "red" : "gray"} />
          </div>

          <div
            style={{
              position: "absolute",
              bottom: 54,
              right: 8,
              fontSize: ".8em",
              color: "rgba(0,0,0,.9)",
            }}
          >
            {bytesToSize(file.size)}
          </div>
        </Cover>
      </Cover>
    </ButtonTransparent>
  );
}
