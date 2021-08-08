import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import { useCallback, useMemo, useState } from "react";

import { utils } from "media-stream-track-controller";

/**
 * Provides direct interaction with media-stream-track-controller for hardware
 * media device capturing.
 *
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useMediaDevicesCapture() {
  const [
    _mediaDeviceCaptureControllerFactories,
    _setMediaDeviceControllerFactories,
  ] = useState([]);

  /**
   * Removes a MediaStreamTrackControllerFactory from the internal state of
   * factories.
   *
   * @param {MediaStreamTrackControllerFactory}
   * @return {void}
   */
  const _removeControllerFactory = useCallback(controllerFactory => {
    _setMediaDeviceControllerFactories(prev =>
      prev.filter(
        prevFactory =>
          !PhantomCore.getIsSameInstance(prevFactory, controllerFactory)
      )
    );
  }, []);

  /**
   * Adds a MediaStreamTrackControllerFactory to the internal state of
   * factories.
   *
   * @param {MediaStreamTrackControllerFactory}
   * @return {void}
   */
  const _addControllerFactory = useCallback(
    controllerFactory => {
      // Remove controller factory from state once destroyed
      controllerFactory.once(EVT_DESTROYED, () =>
        _removeControllerFactory(controllerFactory)
      );

      _setMediaDeviceControllerFactories(prev => [...prev, controllerFactory]);
    },
    [_removeControllerFactory]
  );

  /**
   * @see https://github.com/zenOSmosis/media-stream-track-controller/blob/main/src/utils/captureMediaDevice.js
   * @return {Promise<MediaStreamTrackControllerFactory>}
   */
  const captureMediaDevice = useCallback(
    async (constraints = {}, factoryOptions = {}) => {
      const controllerFactory = await utils.captureMediaDevice(
        constraints,
        factoryOptions
      );

      _addControllerFactory(controllerFactory);

      return controllerFactory;
    },
    [_addControllerFactory]
  );

  /**
   * @see https://github.com/zenOSmosis/media-stream-track-controller/blob/main/src/utils/captureMediaDevice.js
   * @return {Promise<MediaStreamTrackControllerFactory>}
   */
  const captureSpecificMediaDevice = useCallback(
    async (mediaDeviceInfo, constraints = {}, factoryOptions = {}) => {
      const controllerFactory =
        await utils.captureMediaDevice.captureSpecificMediaDevice(
          mediaDeviceInfo,
          constraints,
          factoryOptions
        );

      _addControllerFactory(controllerFactory);

      return controllerFactory;
    },
    [_addControllerFactory]
  );

  const { audioCaptureDeviceControllers, videoCaptureDeviceControllers } =
    useMemo(() => {
      const audioCaptureDeviceControllers =
        _mediaDeviceCaptureControllerFactories
          .map(factory => factory.getAudioTrackControllers())
          .flat();

      const videoCaptureDeviceControllers =
        _mediaDeviceCaptureControllerFactories
          .map(factory => factory.getVideoTrackControllers())
          .flat();

      return {
        audioCaptureDeviceControllers,
        videoCaptureDeviceControllers,
      };
    }, [_mediaDeviceCaptureControllerFactories]);

  return {
    captureMediaDevice,
    captureSpecificMediaDevice,

    audioCaptureDeviceControllers,
    videoCaptureDeviceControllers,
  };
}
