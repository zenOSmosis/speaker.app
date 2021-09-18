import React from "react";
import { Knob } from "react-rotary-knob";
// import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./LabeledKnob.module.css";

export default function LabeledKnob({ className, label, ...rest }) {
  return (
    <div className={classNames(styles["labeled-knob"], className)}>
      <div>
        <Knob style={{ display: "inline-block" }} {...rest} />
      </div>
      <div>{label}</div>
    </div>
  );
}
