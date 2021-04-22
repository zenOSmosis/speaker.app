import React, { useCallback, useRef } from "react";
import classNames from "classnames";
import styles from "./ColorPickerWheel.module.css";

/**
 * IMPORTANT! Currently only provides only a limited set of colors
 *
 * Implement ability to set initial value and to adjust brightness level
 *
 * For original source:
 * @see https://codepen.io/KarstenBuckstegge/details/Fcgsy
 */
export default function ColorPickerWheel({ className, onChange, ...rest }) {
  const refWrap = useRef(null);
  const refWheel = useRef(null);
  const refWrapperPin = useRef(null);

  const handleWheelClick = useCallback(
    (evt) => {
      const elWrap = refWrap.current;

      // The parent node of this component
      const elParent = elWrap.parentNode;

      const elWheel = refWheel.current;

      // jQuery shim (we're not using jQuery here)
      const parentOffset = (() => {
        const rect = elWheel.getBoundingClientRect();
        return {
          top: rect.top + elParent.scrollTop,
          left: rect.left + elParent.scrollLeft,
        };
      })();

      // TODO: What does 76 mean?
      const offX = evt.pageX - parentOffset.left - 76;
      const offY = evt.pageY - parentOffset.top - 76;

      // calculate degree of rotation to click position
      const calcDeg = Math.atan2(offY, offX) * (180 / Math.PI);

      /**
       *
       *  Rotate the Pin
       *
       */

      let actualDeg;
      if (calcDeg < -89) {
        actualDeg = 270 + (180 + calcDeg);
      } else {
        actualDeg = 90 + calcDeg;
      }

      // Rotate the pin to the given rotation angle
      const rotateCss = "rotate(" + actualDeg + "deg)";
      refWrapperPin.current.style.transform = rotateCss;

      /**
       *
       *  Calculate Colors
       *
       */

      // max and min rgb value
      const rgbHigh = 134;
      const rgbLow = 37;

      // difference between highest rgb value and lowest
      const rgbDiff = rgbHigh - rgbLow;

      let rgb = [];

      // IMPORTANT!  The following may appear to be like duplicated code, but
      // each quadrant is handled slightly different

      // TODO: Clean up these comments as necessary

      // check which half I'm in (bottom / top)
      if (calcDeg >= 0) {
        // in what part of the half did the click happen?
        let percent = calcDeg / 180;

        if (percent >= 0 && percent < 0.33) {
          // what position in the part did the click happen in
          const currentPos = percent / 0.33;
          // how much value must be deducted/added to the rgb value
          const rgbChange = rgbDiff * currentPos;
          // deduct value
          const rgbNew = Math.round(rgbHigh - rgbChange);

          rgb = [rgbLow, rgbHigh, rgbNew];
        } else if (percent >= 0.33 && percent < 0.66) {
          // what position in the part did the click happen in
          const currentPos = (percent - 0.33) / 0.33;
          // how much value must be deducted/added to the rgb value
          const rgbChange = rgbDiff * currentPos;
          // deduct value
          const rgbNew = Math.round(rgbHigh + rgbChange);

          rgb = [rgbNew, rgbHigh, rgbLow];
        } else {
          // what position in the part did the click happen in
          const currentPos = (percent - 0.66) / 0.33;
          // how much value must be deducted/added to the rgb value
          const rgbChange = rgbDiff * currentPos;
          // deduct value
          const rgbNew = Math.round(rgbHigh - rgbChange);

          rgb = [rgbHigh, rgbNew, rgbLow];
        }
      } else {
        const percent = -(calcDeg / 180);

        if (percent >= 0 && percent < 0.33) {
          // what position in the part did the click happen in
          const currentPos = percent / 0.33;
          // how much value must be deducted/added to the rgb value
          const rgbChange = rgbDiff * currentPos;
          // deduct value
          const rgbNew = Math.round(rgbHigh - rgbChange);

          rgb = [rgbLow, rgbNew, rgbHigh];
        } else if (percent >= 0.33 && percent < 0.66) {
          // what position in the part did the click happen in
          const currentPos = (percent - 0.33) / 0.33;
          // how much value must be deducted/added to the rgb value
          const rgbChange = rgbDiff * currentPos;
          // deduct value
          const rgbNew = Math.round(rgbHigh - rgbChange);

          rgb = [rgbNew, rgbLow, rgbHigh];
        } else {
          // what position in the part did the click happen in
          const currentPos = (percent - 0.66) / 0.33;
          // how much value must be deducted/added to the rgb value
          const rgbChange = rgbDiff * currentPos;
          // deduct value
          const rgbNew = Math.round(rgbHigh - rgbChange);

          rgb = [rgbHigh, rgbLow, rgbNew];
        }
      }

      // CSS color
      onChange(`rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`);
    },
    [onChange]
  );

  return (
    <div
      {...rest}
      ref={refWrap}
      className={classNames(styles["color-picker-wheel"], className)}
    >
      <div className={styles["button"]}>
        <div className={styles["center"]}>
          <div ref={refWrapperPin} className={styles["wrapper__pin"]}>
            <div className={styles["pin"]}></div>
          </div>
        </div>
        <div
          ref={refWheel}
          onClick={handleWheelClick}
          onTouchStart={handleWheelClick}
          className={styles["wheel"]}
        >
          <ul className={styles["colors"]}>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
            <li className={styles["color"]}></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
