import React from "react";
import AutoScaler from "@components/AutoScaler";
import Animation from "@components/Animation";

import speakerAppLogo from "@assets/speaker.app.logo.svg";

import classNames from "classnames";
import styles from "./SpeakerAppLogoScene.module.css";

// TODO: Gradient logo
// @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
//
/**
 * background-clip: text;
 * -webkit-background-clip: text;
 * color: transparent;
 *     background: -webkit-linear-gradient(
-70deg
,#db469f,#2188ff);
 */

export default function SpeakerAppLogoScene({
  className,
  disableAnimation = false,
  ...rest
}) {
  return (
    <AutoScaler>
      <Animation
        animationName="fadeIn"
        disabled={disableAnimation}
        className={classNames(styles["speaker-app-logo-scene"], className)}
        {...rest}
      >
        <img src={speakerAppLogo} alt="Speaker App" />
        <div style={{ opacity: ".8", fontWeight: "bold" }}>
          <span style={{ color: "orange" }}>speaker</span>.app
        </div>
      </Animation>
    </AutoScaler>
  );
}
