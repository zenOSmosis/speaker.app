import React, { useEffect, useMemo, useState, useRef } from "react";

/**
 * Represents audio or video element.
 *
 * TODO: Document and rename
 */
export default function AVBase({
  mediaStreamTrack,
  mediaType = "video",
  onEl = (el) => null,
  ...rest
}) {
  const [el, setEl] = useState(null);

  const mediaStream = useMemo(
    () => mediaStreamTrack && new MediaStream([mediaStreamTrack]),
    [mediaStreamTrack]
  );

  useEffect(() => {
    if (!el || !mediaStream) {
      return;
    }

    el.srcObject = mediaStream;

    // TODO: Emit events when playing in order to perform "read receipts" for remote participants

    el.play()
      .then(() => (el.muted = false))
      .catch((err) => console.warn("Caught", err));
  }, [el, mediaStream]);

  const refOnEl = useRef(onEl);

  useEffect(() => {
    const onEl = refOnEl.current;

    if (el && typeof onEl === "function") {
      onEl(el);
    }
  }, [el]);

  return React.createElement(mediaType, {
    ref: setEl,
    autoPlay: false,
    muted: true,
    playsInline: true,
    controls: false,
    ...rest,
  });
}
