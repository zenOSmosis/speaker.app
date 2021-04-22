import React, { useState } from "react";

import classNames from "classnames";
import styles from "./Marquee.module.css";

import useOverflowDetection from "@hooks/useOverflowDetection";

/**
 * Adds a Marquee effect to the children, provided they overflow the container.
 *
 * NOTE: Wrapping elements must have a defined width.
 *
 * IMPORTANT: Use this sparingly!  Induces high CPU load on certain devices.
 *
 * @see https://jsfiddle.net/jonathansampson/yxppkv3j/
 */
export default function Marquee({ children, className, ...rest }) {
  const [el, setEl] = useState(null);
  const isOverflown = useOverflowDetection(el);

  return (
    <div
      {...rest}
      ref={setEl}
      className={classNames(isOverflown ? styles["marquee"] : null, className)}
    >
      <div className={isOverflown ? styles["marquee__inner"] : null}>
        {children}
      </div>
    </div>
  );
}
