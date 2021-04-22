import React, { useEffect, useRef, useState } from "react";
import StaggeredWaveLoading from "../StaggeredWaveLoading";
import PropTypes from "prop-types";

import PreloadLib from "preload-it";

Preload.propTypes = {
  /**
   * @type {string[]} A list of URLs to preload.
   */
  preloadResources: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,

  onError: PropTypes.func,
};

export default function Preload({
  children,
  preloadResources,
  onError = (err) => console.warn("Caught", err),
  ...rest
}) {
  // IMPORTANT: null is used as default value to skip initial loading animation
  // if re-mounting the component after preloaded resources have already been
  // cached
  const [isLoaded, _setIsLoaded] = useState(null);

  const refResources = useRef(preloadResources);
  const refOnError = useRef(onError);

  useEffect(() => {
    let isMounted = true;

    const preloadResources = refResources.current;
    const onError = refOnError.current;

    const preload = PreloadLib();
    preload
      .fetch(preloadResources)
      .then(() => {
        if (isMounted) {
          _setIsLoaded(true);
        }
      })
      .catch(onError);

    return function unmount() {
      isMounted = false;
    };
  }, []);

  if (isLoaded === null) {
    return null;
  }

  if (!isLoaded) {
    return (
      <div {...rest}>
        <StaggeredWaveLoading />
      </div>
    );
  } else {
    return <React.Fragment>{children}</React.Fragment>;
  }
}
