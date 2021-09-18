import React, { useEffect, useState } from "react";
import Preload from "../Preload";

import classNames from "classnames";
import styles from "./VUMeter.module.css";

import vuBackground from "./images/vu.png";
import vuNeedle from "./images/needle.png";

export default function VUMeter({
  label = "Mono",
  percent = 0,
  className,
  ...rest
}) {
  if (percent < 0) percent = 0;
  if (percent > 100) percent = 100;

  const [vu, setVu] = useState(null);
  const [needle, setNeedle] = useState(null);

  useEffect(() => {
    if (vu && needle) {
      vu.style.backgroundImage = `url(${vuBackground})`;
      vu.style.backgroundPosition = "top left";
      vu.style.backgroundRepeat = "no-repeat";

      needle.style.backgroundImage = `url(${vuNeedle})`;
      needle.style.backgroundPosition = "top left";
      needle.style.backgroundRepeat = "no-repeat";
    }
  }, [vu, needle]);

  useEffect(() => {
    if (needle) {
      needle.style.transform = `rotateZ(${Math.min(87 * (percent / 100))}deg)`;
    }
  }, [needle, percent]);

  return (
    <Preload preloadResources={[vuBackground, vuNeedle]}>
      <div
        ref={setVu}
        className={classNames(styles["vu"], className)}
        {...rest}
      >
        <div className={styles["mask"]}>
          <div
            ref={setNeedle}
            className={styles["needle"]}
            style={{ transform: "rotateZ(0deg)" }}
          ></div>
        </div>
        <p className={styles["vu-label"]}>{label}</p>
      </div>
    </Preload>
  );
}
