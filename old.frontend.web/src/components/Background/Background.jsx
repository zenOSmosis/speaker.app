import React from "react";
import Cover from "../Cover";
import Full from "../Full";
import Image from "../Image";
import classNames from "classnames";
import styles from "./Background.module.css";

export default function Background({
  children,
  src,
  className,
  style,
  onLoad = (ref) => null,
  ...propsRest
}) {
  return (
    <Full
      {...propsRest}
      className={classNames(styles["background"], className)}
    >
      <Cover className={styles["cover"]}>
        {typeof src === "string" && (
          <Image className={styles["image"]} src={src} onLoad={onLoad} />
        )}
        {(typeof src === "object" || typeof src === "function") &&
          (() => {
            const DisplayComponent = src;

            return <DisplayComponent />;
          })()}
      </Cover>

      <Cover style={style}>{children}</Cover>
    </Full>
  );
}
