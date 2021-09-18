import { useEffect } from "react";

// TODO: Implement listener which can act as a kill-switch to prevent listening, when enabled
export default function useKeyboardEvents(props = {}) {
  const {
    onKeyDown = (keyCode) => null,
    onKeyUp = (keyCode) => null,
    isEnabled = true,
  } = props || {};

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const _handleKeyDown = (evt) => {
      // Prevent repeated calls from holding down a key
      if (evt.repeat) {
        return;
      }

      // TODO: Configure this to automatically trigger on/off depending if
      // there is a text element in focus (prevents ability to type when on)
      // evt.preventDefault();

      onKeyDown(evt.which);
    };

    const _handleKeyUp = (evt) => {
      evt.preventDefault();

      onKeyUp(evt.which);
    };

    window.addEventListener("keydown", _handleKeyDown);
    window.addEventListener("keyup", _handleKeyUp);

    // TODO: If window is blurred, component is unmounted, send keyup for current down key so it doesn't get stuck

    return function unmount() {
      window.removeEventListener("keydown", _handleKeyDown);
      window.removeEventListener("keyup", _handleKeyUp);
    };
  }, [onKeyDown, onKeyUp, isEnabled]);
}
