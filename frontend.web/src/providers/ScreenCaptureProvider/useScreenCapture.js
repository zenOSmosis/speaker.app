import PhantomCore from "phantom-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MediaStreamTrackControllerEvents,
  utils,
} from "media-stream-track-controller";

const { EVT_DESTROYED } = MediaStreamTrackControllerEvents;

/**
 * Supports concurrent screen capturing of multiple streams.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 *
 * // TODO: Document
 */
export default function useScreenCapture() {
  /** @type {MediaStreamTrackControllerFactory[]} */
  const [
    screenCaptureControllerFactories,
    setScreenCaptureControllerFactories,
  ] = useState([]);

  // Auto-manage factory state registration on destruct
  useEffect(() => {
    const boundFactoryListeners = [];

    screenCaptureControllerFactories.forEach(factory => {
      const _handleFactoryDestruct = () => {
        setScreenCaptureControllerFactories(prev =>
          prev.filter(prevFactory => !Object.is(prevFactory, factory))
        );
      };

      factory.once(EVT_DESTROYED, _handleFactoryDestruct);

      boundFactoryListeners.push([factory, _handleFactoryDestruct]);
    });

    return function unmount() {
      boundFactoryListeners.forEach(([factory, listener]) =>
        factory.off(EVT_DESTROYED, listener)
      );
    };
  }, [screenCaptureControllerFactories]);

  const [isScreenSharingSupported, setIsScreenSharingSupported] = useState(
    utils.getIsScreenCaptureSupported()
  );

  /**
   * NOTE: Calling this multiple times will allow parallel screen captures.
   *
   * @param {Object} factoryOptions
   * @return {Promise<MediaStreamTrackControllerFactory}
   */
  const startScreenCapture = useCallback(
    async ({ factoryOptions = {} }) => {
      let screenCaptureControllerFactory;

      try {
        const DEFAULT_FACTORY_OPTIONS = {
          title: `captureScreen-${screenCaptureControllerFactories.length}`,
        };

        screenCaptureControllerFactory = await utils.captureScreen(
          null,
          // Dynamically give the factory an alias based on the number of the
          // index it will be in the state array
          PhantomCore.mergeOptions(DEFAULT_FACTORY_OPTIONS, factoryOptions)
        );
      } catch (err) {
        console.warn("Caught", err);

        // TODO: The following MAY be resolved; test it
        //
        // FIXME: Safari 14 (desktop / BrowserStack) throws "Unhandled Rejection
        // (InvalidAccessError): getDisplayMedia must be called from a user
        // gesture handler."
        //
        // This is likely caused by the multiple redirections from calling this
        // directly in a hook.
        if (
          err.message ===
          "getDisplayMedia must be called from a user gesture handler."
        ) {
          // TODO: Handle more gracefully
          alert(
            "There is currently an issue with trying to do screen sharing with Safari.  Please try from a different browser."
          );
        }

        return setIsScreenSharingSupported(false);
      }

      // Register screen capture w/ list of streams
      setScreenCaptureControllerFactories(prev => [
        ...prev,
        screenCaptureControllerFactory,
      ]);

      return screenCaptureControllerFactory;
    },
    [screenCaptureControllerFactories]
  );

  /**
   * @param {MediaStreamTrackControllerFactory} mediaStreamTrackControllerFactory?
   * [optional] If nothing is passed, all existing screen capture factories
   * will be stopped.
   * @return {Promise<void>}
   */
  const stopScreenCapture = useCallback(
    (screenCaptureControllerFactory = null) => {
      if (!screenCaptureControllerFactory) {
        // Iterate through all screen captures, and stop those streams
        return Promise.all(
          screenCaptureControllerFactories.map(factory => factory.destroy())
        );
      } else {
        return screenCaptureControllerFactory.destroy();
      }
    },
    [screenCaptureControllerFactories]
  );

  /** @type {boolean} */
  const isScreenSharing = useMemo(
    () => screenCaptureControllerFactories.length > 0,
    [screenCaptureControllerFactories]
  );

  /**
   * @return {Promise<void>}
   */
  const toggleScreenCapture = useCallback(async () => {
    if (isScreenSharing) {
      stopScreenCapture();
    } else {
      await startScreenCapture();
    }
  }, [isScreenSharing, startScreenCapture, stopScreenCapture]);

  /** @type {MediaStream[]} */
  const screenCaptureMediaStreams = useMemo(
    () =>
      screenCaptureControllerFactories.map(factory =>
        factory.getOutputMediaStream()
      ),
    [screenCaptureControllerFactories]
  );

  return {
    isScreenSharingSupported,
    startScreenCapture,
    stopScreenCapture,
    toggleScreenCapture,
    screenCaptureMediaStreams,
    screenCaptureControllerFactories,
    isScreenSharing,
  };
}
