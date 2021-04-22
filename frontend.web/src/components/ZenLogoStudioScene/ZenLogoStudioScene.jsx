import React from "react";
import Full from "@components/Full";
import Cover from "@components/Cover";
import Center from "@components/Center";
import AutoScaler from "@components/AutoScaler";
import Animation from "@components/Animation";

import classNames from "classnames";
import styles from "./ZenLogoStudioScene.module.css";

import zenLogo from "@assets/zenOSmosis-Logo-2046x530@72.png";

import { ReactComponent as Objects1 } from "./assets/objects1.svg";
import { ReactComponent as Objects2 } from "./assets/objects2.svg";
import { ReactComponent as Objects3 } from "./assets/objects3.svg";

export default function ZenLogoStudioScene({ className, ...rest }) {
  return (
    <Full
      {...rest}
      className={classNames(styles["logo-studio-scene"], className)}
    >
      <Cover>
        <Animation animationName="rotateIn" animationDuration="5s">
          <AutoScaler>
            <Objects1 className={styles["sub-asset"]} />
          </AutoScaler>
        </Animation>
      </Cover>
      <Cover>
        <Animation animationName="rotateInUpLeft" animationDuration="3s">
          <AutoScaler>
            <Objects2 className={styles["sub-asset"]} />
          </AutoScaler>
        </Animation>
      </Cover>
      <Cover>
        <Animation animationName="rotateInUpRight" animationDuration="7s">
          <AutoScaler>
            <Objects3 className={styles["sub-asset"]} />
          </AutoScaler>
        </Animation>
      </Cover>
      <Cover>
        <Animation
          style={{ backgroundColor: "rgba(0,0,0,.7)" }}
          animationName="fadeIn"
          animationDuration="10s"
        />
      </Cover>
      <Cover>
        <Animation animationName="zoomInUp" animationDuration="3s">
          <Center>
            <img
              src={zenLogo}
              alt="zenOSmosis logo"
              style={{ maxWidth: "90%", marginBottom: "10%" }}
            />
          </Center>
        </Animation>
      </Cover>

      {
        // Prevent logo from being draggable
      }
      <Cover />
    </Full>
  );
}
