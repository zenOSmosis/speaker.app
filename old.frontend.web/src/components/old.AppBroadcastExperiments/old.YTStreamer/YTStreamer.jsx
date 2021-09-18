import React, { useEffect, useRef, useState } from "react";
import Center from "../../Center";

/*
const STREAM_TYPE_AUDIO = "audio";
const STREAM_TYPE_AUDIO_VIDEO = "audio-video";
*/

export default function YTStreamer({ zenRTCPeer, isZenRTCConnected }) {
  const refVideo = useRef(null);

  const [url, setUrl] = useState("");

  useEffect(() => {
    if (isZenRTCConnected) {
      const video = refVideo.current;

      const handlePlaying = () => {
        video.removeEventListener("playing", handlePlaying);

        // TODO: Implement ability to do audio-only streaming

        const mediaStream = video.captureStream();

        // TODO: Await until peer has connected
        zenRTCPeer.publishMediaStream(mediaStream);
      };

      video.addEventListener("playing", handlePlaying);
    }
  }, [zenRTCPeer, isZenRTCConnected]);

  return (
    <Center>
      {!isZenRTCConnected ? (
        <span>Connect to start streaming.</span>
      ) : (
        <div>
          <video ref={refVideo} src={`./ytdl/?url=${url}`} controls />

          <div>
            <form
              onSubmit={(evt) => {
                evt.preventDefault();
                const url = evt.target.elements.namedItem("url").value;

                setUrl(url);
              }}
            >
              <input
                type="text"
                name="url"
                placeholder="video url"
                defaultValue={url}
              />
              <input type="submit" />
            </form>
          </div>
        </div>
      )}
    </Center>
  );
}
