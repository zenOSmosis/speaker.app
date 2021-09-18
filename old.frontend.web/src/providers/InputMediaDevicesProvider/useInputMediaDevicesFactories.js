import { logger, EVT_DESTROYED } from "phantom-core";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MediaStreamTrackControllerFactory,
  utils,
} from "media-stream-track-controller";

import useArrayDiff from "@hooks/useArrayDiff";

// TODO: Document
/**
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 */
export default function useInputMediaDevicesFactories({
  isInCall,
  isAudioSelectorRendered,

  selectedInputMediaDevices,
  testingInputMediaDevices,

  removeSelectedInputMediaDevice,
  removeTestingInputMediaDevice,
}) {
  const [inputMediaDevicesFactories, _setInputMediaDeviceFactories] = useState(
    []
  );

  const { addedInputMediaDevices, removedInputMediaDevices } =
    useAddedAndRemovedSelectedAndTestingInputMediaDevices({
      isInCall,
      isAudioSelectorRendered,
      selectedInputMediaDevices,
      testingInputMediaDevices,
    });

  /**
   * @return {Promise<void>}
   */
  const destroyAllInputMediaDeviceFactories = useCallback(async () => {
    // IMPORTANT: Factories aren't looked up from the state here due to the
    // fact the state might not currently be written w/ this info depending on
    // where we are in the event loop
    const factories = [
      ...new Set([...selectedInputMediaDevices, ...testingInputMediaDevices]),
    ]
      .map(device =>
        MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
          device,
          "audio"
        )
      )
      .flat();

    if (factories.length) {
      await Promise.all(factories.map(factory => factory.destroy()));

      _setInputMediaDeviceFactories([]);
    }
  }, [selectedInputMediaDevices, testingInputMediaDevices]);

  // Fixes issue where removing individual device on Safari would not
  // completely stop the audio capturing (appeared to stop, then restart, even
  // though the relevant device was not selected)
  useEffect(() => {
    // IMPORTANT: The primary reason for the inputMediaDevicesFactory length
    // check is to consume this dependency and make this hook re-rerun every
    // time it changes
    if (inputMediaDevicesFactories.length) {
      removedInputMediaDevices.forEach(mediaDevice => {
        const factories =
          MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
            mediaDevice
          );

        factories.forEach(factory => factory.destroy());
      });
    }
  }, [inputMediaDevicesFactories, removedInputMediaDevices]);

  // Dynamic capturing / uncapturing of media devices based on determined state
  useEffect(() => {
    const areSelectedDevicesEnabled = isInCall || isAudioSelectorRendered;
    const areTestingDevicesEnabled = isAudioSelectorRendered;

    if (!areSelectedDevicesEnabled && !areTestingDevicesEnabled) {
      destroyAllInputMediaDeviceFactories();
    } else {
      (async () => {
        const removeFactoryPromises = removedInputMediaDevices
          .map(async removedMediaDevice => {
            const factories =
              MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
                removedMediaDevice
              );

            if (factories) {
              await factories.forEach(factory => factory.destroy());

              return factories;
            } else {
              return [];
            }
          })
          .flat();

        const removedFactories = await Promise.all(removeFactoryPromises);

        const addedFactories = [];
        for (const addedMediaDevice of addedInputMediaDevices) {
          // TODO: Populate with default constraints / factory options
          const constraints = {};
          const factoryOptions = {};

          // Ignore duplicate factory creation w/ same device
          if (
            MediaStreamTrackControllerFactory.getFactoriesWithInputMediaDevice(
              addedMediaDevice
            ).length
          ) {
            continue;
          }

          try {
            const factory =
              await utils.captureMediaDevice.captureSpecificMediaDevice(
                addedMediaDevice,
                constraints,
                factoryOptions
              );

            factory.once(EVT_DESTROYED, () => {
              _setInputMediaDeviceFactories(prev =>
                [...prev].filter(predicate => predicate !== factory)
              );
            });

            addedFactories.push(factory);
          } catch (err) {
            // Remove device from selecting / testing states (so UI will update)
            removeSelectedInputMediaDevice(addedMediaDevice);
            removeTestingInputMediaDevice(addedMediaDevice);

            logger.error(err);
          }
        }

        if (removedFactories.length || addedFactories.length) {
          // Set next factories state
          _setInputMediaDeviceFactories(prevFactories => {
            const nextFactories = [
              ...prevFactories.filter(factory =>
                removedFactories.includes(factory)
              ),
              ...addedFactories,
            ];

            return nextFactories;
          });
        }
      })();
    }
  }, [
    isAudioSelectorRendered,
    isInCall,

    addedInputMediaDevices,
    removedInputMediaDevices,

    selectedInputMediaDevices,
    testingInputMediaDevices,

    removeSelectedInputMediaDevice,
    removeTestingInputMediaDevice,

    destroyAllInputMediaDeviceFactories,
  ]);

  // TODO: Document
  const allAudioInputMediaStreamTracks = useMemo(() => {
    return inputMediaDevicesFactories
      .map(factory =>
        factory
          .getAudioTrackControllers()
          .map(controller => controller.getOutputMediaStreamTrack())
          .filter(track => track.readyState !== "ended")
      )
      .flat();
  }, [inputMediaDevicesFactories]);

  return {
    inputMediaDevicesFactories,

    allAudioInputMediaStreamTracks,
  };
}

// FIXME: Rename
function useAddedAndRemovedSelectedAndTestingInputMediaDevices({
  isInCall,
  isAudioSelectorRendered,
  selectedInputMediaDevices,
  testingInputMediaDevices,
}) {
  // FIXME: Rename
  const comparisonDiff = useMemo(() => {
    if (!isInCall && !isAudioSelectorRendered) {
      return [];
    }

    return [
      ...new Set([...selectedInputMediaDevices, ...testingInputMediaDevices]),
    ];
  }, [
    isInCall,
    isAudioSelectorRendered,
    selectedInputMediaDevices,
    testingInputMediaDevices,
  ]);

  // FIXME: Rename
  const { added: addedInputMediaDevices, removed: removedInputMediaDevices } =
    useArrayDiff(comparisonDiff);

  return {
    addedInputMediaDevices,
    removedInputMediaDevices,
  };
}
