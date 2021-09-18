import React from "react";
import ComputerKeyboardKeyBase from "../ComputerKeyboardKeyBase/ComputerKeyboardKeyBase";

export default function EscapeKey({
  primaryLabel = (
    <span style={{ textAlign: "left", fontWeight: "bold" }}>Esc</span>
  ),
  secondaryLabel,
  ...rest
}) {
  return (
    <ComputerKeyboardKeyBase keyCode={27} {...rest}>
      <div
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          width: "100%",
          textAlign: "left",
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
