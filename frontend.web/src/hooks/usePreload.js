import { useEffect, useState } from "react";
import Preload from "preload-it";

/**
 * @param {string[]} resources?
 * @return {Object}
 */
export default function usePreload(resources = []) {
  const [isPreloaded, _setIsPreloaded] = useState(false);
  const [progress, _setProgress] = useState(0);

  useEffect(() => {
    if (resources.length) {
      const preload = new Preload();

      preload.onprogress = (evt) => {
        _setProgress(evt.progress);
      };

      preload.oncomplete = (items) => {
        _setIsPreloaded(true);
      };

      preload.fetch(resources);
    } else {
      _setIsPreloaded(true);
      _setProgress(100);
    }
  }, [resources]);

  return {
    isPreloaded,
    progress,
  };
}
