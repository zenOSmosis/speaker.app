import { useEffect, useRef, useState } from "react";
import Preload from "preload-it";

/**
 * Pre-loads resources, as a React hook.
 *
 * @param {string[]} resources An array of URLs to preload. Note that these are
 * cached and the list cannot be changed without re-instantiating the hook.
 * @return {Object}
 */
export default function usePreload(resources) {
  const [isPreloaded, _setIsPreloaded] = useState(false);
  const [progress, _setProgress] = useState(0);

  // Cache the resources; This fixes an issue where passing in a non-memoized
  // array could cause the following useEffect to trigger more than once.
  //
  // Issue was discovered when images would preload multiple times in Firefox.
  const refResources = useRef(resources);

  useEffect(() => {
    const resources = refResources;

    if (resources.length) {
      const preload = new Preload();

      preload.onprogress = evt => {
        _setProgress(evt.progress);
      };

      preload.oncomplete = items => {
        _setIsPreloaded(true);
      };

      preload.fetch(resources);
    } else {
      _setIsPreloaded(true);
      _setProgress(100);
    }
  }, []);

  return {
    isPreloaded,
    progress,
  };
}
