import React, { useCallback, useState } from "react";
import ButtonTransparent from "../../ButtonTransparent";
import classNames from "classnames";
import styles from "./ComputerKeyboardKeyBase.module.css";
import useKeyboardEvents from "@hooks/useKeyboardEvents";
import PropTypes from "prop-types";

ComputerKeyboardKeyBase.propTypes = {
  keyCode: PropTypes.number.isRequired,
};

export default function ComputerKeyboardKeyBase({
  keyCode,
  children,
  className,
  onKeyDown = () => null,
  onKeyUp = () => null,
  onClick = () => null,
  ...rest
}) {
  const [isPressed, setIsPressed] = useState(false);

  const handleKeyDown = useCallback(() => {
    setIsPressed(true);
    onKeyDown();
  }, [onKeyDown]);

  const handleKeyUp = useCallback(() => {
    setIsPressed(false);
    onClick();
    onKeyUp();
  }, [onClick, onKeyUp]);

  useKeyboardEvents({
    onKeyDown: (pressedKeyCode) => {
      if (pressedKeyCode === keyCode) {
        handleKeyDown();
      }
    },

    onKeyUp: (pressedKeyCode) => {
      if (pressedKeyCode === keyCode) {
        handleKeyUp();
      }
    },
  });

  // Note: Some of these properties are routed to the inner wrapper
  //
  // Also note: It's not a recommended practice to put div tags inside of
  // button tags, but the only other way to accomplish this is to use div tags
  // w/ click handlers which is not a recommended practice either
  return (
    <ButtonTransparent
      className={styles["computer-keyboard-key-base"]}
      onClick={handleKeyUp}
      // TODO: Handle low-press touch
      onMouseDown={handleKeyDown}
      onTouchStart={handleKeyDown}
    >
      <div
        className={classNames(
          styles["inner-wrapper"],
          isPressed ? styles["pressed"] : null,
          className
        )}
        {...rest}
      >
        {children}
      </div>
    </ButtonTransparent>
  );
}
