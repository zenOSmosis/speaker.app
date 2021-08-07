import PhantomCore, { EVT_DESTROYED } from "phantom-core";
import { useCallback, useMemo, useState } from "react";

import { utils } from "media-stream-track-controller";

// TODO: Document
export default function useMediaDevicesCapture() {
  const [
    _mediaDeviceCaptureControllerFactories,
    _setMediaDeviceControllerFactories,
  ] = useState([]);

  const _removeControllerFactory = useCallback(controllerFactory => {
    _setMediaDeviceControllerFactories(prev =>
      prev.filter(
        prevFactory =>
          !PhantomCore.getIsSameInstance(prevFactory, controllerFactory)
      )
    );
  }, []);

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
