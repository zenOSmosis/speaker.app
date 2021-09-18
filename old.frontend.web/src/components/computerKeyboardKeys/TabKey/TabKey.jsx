import React from "react";
import ComputerKeyboardKeyBase from "../ComputerKeyboardKeyBase/ComputerKeyboardKeyBase";
import LED from "../../LED";
import styles from "./TabKey.module.css";

export default function TabKey({
  isActive,
  primaryLabel = "Tab",
  secondaryLabel,
  ...rest
}) {
  return (
    <ComputerKeyboardKeyBase
      className={styles["tab-key"]}
      keyCode={9}
      {...rest}
    >
      <div style={{ position: "absolute", top: 4, left: 4 }}>
        {primaryLabel}
      </div>
      <div
        style={{
          position: "absolute",
          top: 4,
          right: 4,
        }}
      >
        <LED color={isActive ? "green" : "gray"} />
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
