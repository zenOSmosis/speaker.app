import React from "react";
import ComputerKeyboardKeyBase from "../ComputerKeyboardKeyBase/ComputerKeyboardKeyBase";
import TriangleUpIcon from "@icons/TriangleUpIcon";

export default function DownKey({
  primaryLabel = (
    <div style={{ display: "inline-block", transform: "rotate(180deg)" }}>
      <TriangleUpIcon />
    </div>
  ),
  secondaryLabel,
  ...rest
}) {
  return (
    <ComputerKeyboardKeyBase keyCode={40} {...rest}>
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
