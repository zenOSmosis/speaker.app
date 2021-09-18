import React from "react";
import Animation from "../Animation";
import Background from "../Background";
import Cover from "../Cover";
import Center from "../Center";

import zenOSmosisLogo from "@assets/zenOSmosis-Logo-2046x530@72.png";
import discoveryLaunchLiftoff from "@assets/discovery-launch-liftoff.jpg";

// TODO: Wait for assets to load before trying to use them
// TODO: Fade in background, after loading, then flip in logo

export default function ZenLogoRocketScene() {
  return (
    <Animation
      animationName="fadeIn"
      // animationDuration="2s"
      preloadResources={[discoveryLaunchLiftoff, zenOSmosisLogo]}
    >
      <Background src={discoveryLaunchLiftoff}>
        <Cover style={{ backgroundColor: "rgba(0,0,0,.65)" }}>
          <Center>
            <LogoView />
          </Center>
        </Cover>
      </Background>
    </Animation>
  );
}

function LogoView() {
  return (
    <Center>
      <Animation
        animationName="fadeIn"
        animationDuration="5s"
        // animationDelay=".5s"
      >
        <img src={zenOSmosisLogo} alt="zenOSmosis" style={{ width: "80%" }} />
      </Animation>
    </Center>
  );
}
