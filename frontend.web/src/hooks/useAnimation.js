import { useEffect, useRef } from "react";
import "animate.css";

export default function useAnimation({
  domElement,
  animationName,
  // FIXME: Duration and delay are currently passed as strings because that's
  // what the underlying CSS requires, but they should probably also accept
  // integers representing milliseconds.
  animationDuration = "1s",
  animationDelay = "0s",
  onAnimationEnd,
  animationEngine = "animate.css",
  isDisabled = false,
}) {
  if (typeof animationDuration !== "string") {
    console.warn('animationDuration should be a string (i.e. "1s")');
  }

  if (typeof animationDelay !== "string") {
    console.warn('animationDelay should be a string (i.e. "0s")');
  }

  const refOnAnimationEnd = useRef(onAnimationEnd);

  useEffect(() => {
    if (domElement) {
      if (isDisabled) {
        // TODO: Can this be used as an exported property instead of directly
        // manipulating here?
        domElement.style.visibility = "visible";
      } else {
        const classes = domElement.classList;

        // Unhide the element
        //
        // IMPORTANT: This fixes an issue where text might appear to pop before
        // transition is applied. It should be used in conjunction with opacity
        // being set to 0, initially, as the Animation component does.
        //
        // TODO: Can this be used as an exported property instead of directly
        // manipulating here?
        domElement.style.visibility = "visible";

        domElement.style.animationDuration = animationDuration;
        domElement.style.animationDelay = animationDelay;

        switch (animationEngine) {
          /**
           * @see https://animate.style animate.css
           */
          case "animate.css":
            (() => {
              // TODO: Implement optional animation engine
              // animate.css
              const BASE = "animate__animated";

              if (!classes.contains(BASE)) {
                domElement.classList.add(BASE);
              }

              if (!classes.contains("animate__" + animationName)) {
                domElement.classList.add("animate__" + animationName);
              }
            })();
            break;

          default:
            throw new Error(`Unsupported animation engine: ${animationEngine}`);
        }

        const onAnimationEnd = refOnAnimationEnd.current;

        // TODO: Also handle removing of effect from class list, so we can re-use it, if necessary
        domElement.addEventListener("animationend", onAnimationEnd);

        return function unmount() {
          domElement.removeEventListener("animationend", onAnimationEnd);
        };
      }
    }
  }, [
    animationEngine,
    animationName,
    animationDuration,
    animationDelay,
    domElement,
    isDisabled,
  ]);
}
