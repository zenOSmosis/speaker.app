import React from "react";
import { useEffect, useState } from "react";

export default function TextAnimation({
  text,
  delay = 70,
  onAnimationEnd = () => {},
}) {
  const [renderedText, _setRenderedText] = useState("");

  // Ensure rendered text gets reset once text props have changed
  useEffect(() => {
    _setRenderedText("");
  }, [text]);

  useEffect(() => {
    let _workerInterval = null;
    let _ended = false;

    _workerInterval = setInterval(() => {
      _setRenderedText((oldText) => {
        const lenOldText = oldText.length;

        if (text[lenOldText]) {
          const newText = oldText + text[lenOldText];

          return newText;
        } else {
          clearInterval(_workerInterval);

          // Prevent potential double-callback
          if (!_ended) {
            onAnimationEnd();
          }

          _ended = true;

          return oldText;
        }
      });
    }, delay);

    return function unmount() {
      clearInterval(_workerInterval);
    };
  }, [text, delay, onAnimationEnd]);

  return <span>{renderedText}</span>;
}
