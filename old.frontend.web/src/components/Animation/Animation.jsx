import React, { useMemo, useState } from "react";
import usePreload from "@hooks/usePreload";
import useAnimation from "@hooks/useAnimation";
import classNames from "classnames";
import styles from "./Animation.module.css";

export default function Animation({
  className,
  children,

  // TODO: Rename to effect name
  animationName,
  animationDuration,
  animationDelay,

  animationEngine = "animate.css",
  preloadResources = [],
  onAnimationEnd = () => null,
  tag = "div",
  inline = false,

  disabled = false,
  ...rest
}) {
  const [domElement, _setDomElement] = useState(null);

  const { isPreloaded } = usePreload(preloadResources);

  useAnimation({
    domElement,
    animationName,
    animationDuration,
    animationDelay,
    animationEngine,
    onAnimationEnd,

    // NOTE (jh): I don't really like this, but the alternative is putting
    // isDisabled property on <Animation disabled /> and I don't like that
    // either
    isDisabled: disabled,
  });

  const View = useMemo(() => tag, [tag]);

  if (!isPreloaded) {
    return null;
  }

  return (
    <View
      {...rest}
      ref={_setDomElement}
      className={classNames(
        styles["animation"],
        inline ? styles["inline"] : null,
        className
      )}
    >
      {children}
    </View>
  );
}
