import { useEffect } from "react";
import { MediaStreamTrackControllerCollection } from "media-stream-track-controller";
import usePhantomCollection from "@hooks/usePhantomCollection";

// TODO: Document
/**
 * IMPORTANT: This hook should be treated as a singleton (provider based).
 *
 * @param {Object}
 * @return {Object}
 */
export default function usePublishableTrackControllerCollections({
  selectedInputMediaDevices,
  inputMediaDevicesFactories,
}) {
  const { collection: publishableAudioInputControllerCollection } =
    usePhantomCollection(MediaStreamTrackControllerCollection);

  const { collection: publishableVideoInputControllerCollection } =
    usePhantomCollection(MediaStreamTrackControllerCollection);

  // TODO: Diff out track controllers and add / remove them from their relevant collections
  /*
  useEffect(() => {
    // TODO: Remove
    console.log({
      selectedInputMediaDevices,
      inputMediaDevicesFactories,
    });
  }, [selectedInputMediaDevices, inputMediaDevicesFactories]);
  */

  return {
    publishableAudioInputControllerCollection,
    publishableVideoInputControllerCollection,
  };
}
