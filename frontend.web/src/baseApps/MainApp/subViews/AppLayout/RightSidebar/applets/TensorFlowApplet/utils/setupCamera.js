// @see https://github.com/tensorflow/tfjs-models/blob/master/posenet/demos/camera.js
export default async function setupCamera() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      "Browser API navigator.mediaDevices.getUserMedia not available"
    );
  }

  // const video = document.getElementById("video");
  // video.width = videoWidth;
  // video.height = videoHeight;

  // const mobile = isMobile();
  const videoStream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: "user",
      width: 640, // TODO: Make dynamic
      height: 480, // TODO: Make dynamic
      // width: mobile ? undefined : videoWidth,
      // height: mobile ? undefined : videoHeight,
    },
  });
  // video.srcObject = stream;

  /*
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
  */

  return videoStream.getVideoTracks()[0];
}
