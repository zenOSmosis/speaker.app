import React, { useEffect, useState, useRef } from "react";
import Video from "./Video";

export default function VideoCapture({
  className,
  src,
  onMediaStream = (mediaStream) => console.debug({ mediaStream }),
  onError = (err) => {
    throw err;
  },
  onEl,
  ...rest
}) {
  const [videoEl, _setVideoEl] = useState(null);
  const [mediaStream, _setMediaStream] = useState(null);

  const refMediaStream = useRef(null);
  refMediaStream.current = mediaStream;

  useEffect(() => {
    if (mediaStream) {
      const onMediaStream = refOnMediaStream.current;

      onMediaStream(mediaStream);
    }
  }, [mediaStream]);

  const refOnMediaStream = useRef(onMediaStream);
  const refOnError = useRef(onError);
  const refIsPlaying = useRef(false);

  useEffect(() => {
    if (!videoEl) {
      return;
    }

    // TODO: Remove
    console.log({
      src,
    });

    const onError = (err) => {
      videoEl.pause();

      refOnError.current(err);
    };

    // Determine if video capturing is available
    if (!videoEl.captureStream) {
      onError(new Error("captureStream is not supported in this browser"));

      return;
    }

    // NOTE (jh): "playing" intentionally used instead of "play" as "play" is
    // called before MediaStream is ready
    videoEl.addEventListener("playing", () => {
      try {
        refIsPlaying.current = true;

        if (!refMediaStream.current) {
          const mediaStream = videoEl.captureStream();

          // TODO: Remove
          console.log({
            tracks: mediaStream && mediaStream.getTracks(),
          });

          _setMediaStream(mediaStream);
        }
      } catch (err) {
        onError(err);
      }
    });

    videoEl.addEventListener("ended", () => {
      refIsPlaying.current = false;

      console.log("ended");
    });
  }, [src, videoEl]);

  // IMPORTANT {...rest} should come first so we can be sure to override it here
  return (
    <Video
      {...rest}
      src={src}
      onEl={(videoEl) => {
        _setVideoEl(videoEl);

        if (typeof onEl === "function") {
          onEl(videoEl);
        }
      }}
      // IMPORTANT: If muted, capturing can't happen
      muted={false}
    />
  );
}
