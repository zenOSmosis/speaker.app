let _persistentVideoCaptureElement = null;

/**
 * NOTE: This should probably only be used w/ the local
 * hooks/usePersistentVideoCapture.
 *
 * @return {HTMLVideoElement}
 */
export default function getPersistentVideoCaptureElement() {
  if (!_persistentVideoCaptureElement) {
    _persistentVideoCaptureElement = document.createElement("video");
  }

  return _persistentVideoCaptureElement;
}
