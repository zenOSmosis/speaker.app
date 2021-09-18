import React, { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import styles from "./VideoStreamer.module.css";

export default function VideoStreamer({
  className,
  url,
  onMediaStream = (mediaStream) => console.debug({ mediaStream }),
  onCaptureStreamNotSupported = () =>
    console.error(
      "HTMLMediaElement.captureStream() is not supported in this browser"
    ),
  ...rest
}) {
  const refVideo = useRef(null);
  const refIsPlaying = useRef(false);

  const [isCaptureStreamSupported, _setIsCaptureStreamSupported] = useState(
    true
  );

  useEffect(() => {
    setTimeout(() => {
      const video = refVideo.current;

      if (!video) {
        return;
      }

      if (!video.captureStream) {
        _setIsCaptureStreamSupported(false);

        onCaptureStreamNotSupported();

        return;
      }

      video.addEventListener("playing", async () => {
        if (!refIsPlaying.current) {
          refIsPlaying.current = true;

          /*
          const captureStream = video.captureStream || video.mozCaptureStream;
          const mediaStream = captureStream();
          */

          const mediaStream = video.captureStream();

          onMediaStream(mediaStream);

          console.log("playing");
        }
      });

      video.addEventListener("ended", () => {
        refIsPlaying.current = false;

        console.log("ended");
      });
    }, 100);
  }, [onMediaStream, onCaptureStreamNotSupported]);

  if (!isCaptureStreamSupported) {
    return null;
  }

  return (
    <video
      {...rest}
      ref={refVideo}
      className={classNames(styles["video-streamer"], className)}
      src={url}
      controls
    />
  );
}
