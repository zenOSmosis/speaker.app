import { useEffect, useMemo, useState } from "react";
import /* * as tfjs from*/ "@tensorflow/tfjs"; // TODO: Lazy-load?
import * as posenet from "@tensorflow-models/posenet"; // TODO: Lazy-load?

export default function useVideoPoseNet({
  videoMediaStreamTrack,
  architecture = "MobileNetV1",
  outputStride = 16,
  multiplier = 0.75,
  quantBytes = 2,
  isTracking = false,
  flipHorizontal = false,

  onPoseEstimate = (pose) => console.debug({ pose }),
}) {
  const [net, setNet] = useState(null);

  const elVideo = useMemo(() => document.createElement("video"), []);
  const [isVideoElReady, setIsVideoElReady] = useState(false);

  const [inputResolution, setInputResolution] = useState({
    width: 640,
    height: 480,
  });

  useEffect(() => {
    if (videoMediaStreamTrack) {
      // Obtain resolution from video media stream track
      const { width, height } = videoMediaStreamTrack.getSettings();

      setInputResolution({
        width,
        height,
      });
    }
  }, [videoMediaStreamTrack]);

  useEffect(() => {
    if (!videoMediaStreamTrack) {
      return;
    }

    elVideo.width = inputResolution.width; // TODO: Capture from video
    elVideo.height = inputResolution.height; // TODO: Capture from video

    elVideo.srcObject = new MediaStream([videoMediaStreamTrack]);

    elVideo.onloadeddata = () => {
      setIsVideoElReady(true);
    };
  }, [
    elVideo,
    videoMediaStreamTrack,
    inputResolution.width,
    inputResolution.height,
  ]);

  // Load posenet
  useEffect(() => {
    setNet(null);

    posenet
      .load({
        architecture,
        outputStride,
        inputResolution: {
          width: inputResolution.width,
          height: inputResolution.height,
        },
        multiplier,
        quantBytes,
      })
      .then((net) => setNet(net));
  }, [
    architecture,
    outputStride,
    inputResolution.width,
    inputResolution.height,
    multiplier,
    quantBytes,
  ]);

  useEffect(() => {
    if (!net || !isVideoElReady || !isTracking) {
      return;
    }

    let lastFrameTime = null;

    let _isUnmounting = false;
    // TODO: Implement FPS detection
    const estimatePose = () => {
      if (_isUnmounting) {
        return;
      }

      // TODO: Iterate through each active model

      net.estimateSinglePose(elVideo, { flipHorizontal }).then((pose) => {
        // TODO: Discard pose here to clear up memory

        const now = new Date().getTime();

        const fps = (now - lastFrameTime) / 60;

        lastFrameTime = now;

        onPoseEstimate({
          pose,
          fps,
        });

        window.requestAnimationFrame(estimatePose);
      });
    };

    estimatePose();

    return function unmount() {
      _isUnmounting = true;
    };
  }, [
    isTracking,
    net,
    elVideo,
    isVideoElReady,
    onPoseEstimate,
    flipHorizontal,
  ]);

  return {
    elVideo,
    isTracking,
    isLoading: !net,
  };
}
