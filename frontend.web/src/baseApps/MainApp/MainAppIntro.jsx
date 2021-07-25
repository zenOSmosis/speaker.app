import { useEffect, useState } from "react";
import MainApp from "./MainApp";
import Animation from "@components/Animation";
import Center from "@components/Center";
import zenLogo from "@assets/zenOSmosis-Logo-2046x530@72.png";

import usePreload from "@hooks/usePreload";

export default function MainAppIntro() {
  const [isIntroView, setIsIntroView] = useState(true);
  const { isPreloaded: isLogoPreloaded } = usePreload([zenLogo]);

  useEffect(() => {
    if (isLogoPreloaded) {
      const logoDisplayTimeout = setTimeout(() => {
        setIsIntroView(false);
      }, 2500);

      return function unmount() {
        clearTimeout(logoDisplayTimeout);
      };
    }
  }, [isLogoPreloaded]);

  if (!isLogoPreloaded) {
    return null;
  } else if (isIntroView) {
    return (
      <Center>
        <Animation animationName="fadeIn" animationDuration="5s">
          <div>
            <div>
              <img src={zenLogo} style={{ width: "90%" }} alt="zenOSmosis" />
            </div>
          </div>
        </Animation>
      </Center>
    );
  } else {
    return <MainApp />;
  }
}
