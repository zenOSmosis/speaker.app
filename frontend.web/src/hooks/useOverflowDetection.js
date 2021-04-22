import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fix issue on iOS 13 where ResizeObserver isn't available.
 */
import { install } from "resize-observer";
if (!window.ResizeObserver) {
  install();
}

/**
 * @see https://stackoverflow.com/questions/9333379/check-if-an-elements-content-is-overflowing
 *
 * @param {HTMLElement} element
 * @param {Object} isDetecting? [optional; default = true] Whether or not the
 * hook should detect overflow.
 * @return {boolean}
 */
export default function useOverflowDetection(element, isDetecting = true) {
  const getIsOverflown = useCallback(
    () =>
      (element && element.scrollHeight > element.clientHeight) ||
      (element && element.scrollWidth > element.clientWidth),
    [element]
  );

  const [isOverflown, setIsOverflown] = useState(getIsOverflown());

  const refPrevIsOverflown = useRef(isOverflown);
  refPrevIsOverflown.current = isOverflown;

  useEffect(() => {
    if (isDetecting && element) {
      /**
       * Handles checking of overflown, comparing it with previous state, and
       * determining if the hook state should be updated.
       */
      const checkIsOverflown = () => {
        const prevIsOverflown = refPrevIsOverflown.current;

        const newIsOverflown = getIsOverflown();

        const focusedTagName =
          document.activeElement && document.activeElement.tagName;

        // Ignore overflow adjustments if there is a focused input which can
        // drive the software keyboard on mobile devices.
        //
        // This fixes an issue where it is not possible to type on Android in
        // an input / textarea which is a child of an overflow-able <Center />
        // component.
        if (
          focusedTagName.toLowerCase() !== "input" &&
          focusedTagName.toLowerCase() !== "textarea"
        ) {
          if (prevIsOverflown !== newIsOverflown) {
            setIsOverflown(newIsOverflown);
          }
        }
      };

      const ro = new ResizeObserver((entries) => {
        /**
         * IMPORTANT: requestAnimationFrame is used here to prevent possible
         * "resize-observer loop limit exceeeded error."
         *
         * "This error means that ResizeObserver was not able to deliver all
         * observations within a single animation frame. It is benign (your site
         * will not break)."
         *
         * @see https://stackoverflow.com/questions/49384120/resizeobserver-loop-limit-exceeded
         */
        window.requestAnimationFrame(checkIsOverflown);
      });

      ro.observe(element);

      return function unmount() {
        ro.unobserve(element);
      };
    }
  }, [isDetecting, element, getIsOverflown]);

  return isOverflown;
}
