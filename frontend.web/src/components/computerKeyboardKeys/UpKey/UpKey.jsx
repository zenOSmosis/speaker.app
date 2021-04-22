import React from "react";
import ComputerKeyboardKeyBase from "../ComputerKeyboardKeyBase/ComputerKeyboardKeyBase";
import TriangleUpIcon from "@icons/TriangleUpIcon";

export default function UpKey({
  primaryLabel = <TriangleUpIcon />,
  secondaryLabel,
  ...rest
}) {
  return (
    <ComputerKeyboardKeyBase keyCode={38} {...rest}>
      <div
        style={{
          position: "absolute",
          top: 4,
          width: "100%",
          textAlign: "center",
        }}
      >
        {primaryLabel}
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          textAlign: "center",
          fontStyle: "italic",
          fontSize: ".8em",
          fontWeight: "normal",
        }}
      >
        {secondaryLabel}
      </div>
    </ComputerKeyboardKeyBase>
  );
}
