import { useCallback, useEffect, useMemo } from "react";
import getPersistentVideoCaptureElement from "../utils/getPersistentVideoCaptureElement";

import useSharedFilesContext from "@hooks/useSharedFilesContext";

/**
 * @typedef {Object} PersistentVideoCaptureHook
 * @property {HTMLVideoElement} elPersistentVideoCapture
 * @property {function} setSrcFile
 *
 * @return {PersistentVideoCaptureHook}
 */
export default function usePersistentVideoCapture() {
  const elPersistentVideoCapture = useMemo(
    () => getPersistentVideoCaptureElement(),
    []
  );

  const { setElPersistentVideoCapture } = useSharedFilesContext();

  // Sync to provider
  useEffect(() => {
    setElPersistentVideoCapture(elPersistentVideoCapture);
  }, [elPersistentVideoCapture, setElPersistentVideoCapture]);

  const setSrcFile = useCallback(
    (srcFile) => (elPersistentVideoCapture.src = URL.createObjectURL(srcFile)),
    [elPersistentVideoCapture]
  );

  return {
    elPersistentVideoCapture,
    setSrcFile,
  };
}
