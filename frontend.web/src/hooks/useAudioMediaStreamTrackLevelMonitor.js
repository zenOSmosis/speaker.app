import { useEffect, useMemo, useState } from "react";
import {
  MultiAudioMediaStreamTrackLevelMonitor,
  MultiAudioMediaStreamTrackLevelMonitorEvents,
} from "media-stream-track-controller";
import usePrevious from "./usePrevious";

const { EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK } =
  MultiAudioMediaStreamTrackLevelMonitorEvents;

/**
 * Utilizes a MultiAudioMediaStreamTrackLevelMonitor as a React hook.
 *
 * @param {MediaStreamTrack | MediaStreamTrack[] | null} mediaStreamTrackOrTracks?
 * [default = []] A single track, or an array of tracks.  It is made optional
 * because rendered audio level meters may not already have an associated
 * MediaStreamTrack.
 * @return {number} The average percent of all of the input tracks.
 */
export default function useAudioMediaStreamTrackLevelMonitor(
  mediaStreamTrackOrTracks = []
) {
  /**
   * @type {MediaStreamTrack[]}
   */
  const mediaStreamTracks = useMemo(
    () =>
      !mediaStreamTrackOrTracks
        ? []
        : Array.isArray(mediaStreamTrackOrTracks)
        ? mediaStreamTrackOrTracks
        : [mediaStreamTrackOrTracks],
    [mediaStreamTrackOrTracks]
  );

  const previousMediaStreamTracks = usePrevious(mediaStreamTracks, []);

  const [mediaStreamMonitor, _setMediaStreamMonitor] = useState(null);

  const [percent, _setPercent] = useState(null);

  useEffect(() => {
    const mediaStreamMonitor = new MultiAudioMediaStreamTrackLevelMonitor();

    // NOTE: This event handler will automatically be unbound once the class
    // destructs
    mediaStreamMonitor.on(EVT_DEBOUNCED_PEAK_AUDIO_LEVEL_TICK, ({ rms }) => {
      // FIXME: This is probably not supposed to be RMS, but it's close
      // enough for prototyping
      _setPercent(rms);
    });

    _setMediaStreamMonitor(mediaStreamMonitor);

    return function unmount() {
      mediaStreamMonitor.destroy();
    };
  }, []);

  // Sync hook's media stream tracks with the audio monitor instance
  useEffect(() => {
    if (mediaStreamMonitor) {
      const {
        added: addedMediaStreamTracks,
        removed: removedMediaStreamTracks,
      } = MultiAudioMediaStreamTrackLevelMonitor.getChildrenDiff(
        previousMediaStreamTracks,
        mediaStreamTracks
      );

      // Handle added / existing tracks
      for (const track of addedMediaStreamTracks) {
        mediaStreamMonitor.addMediaStreamTrack(track);
      }

      // Handle removed tracks
      for (const track of removedMediaStreamTracks) {
        mediaStreamMonitor.removeMediaStreamTrack(track);
      }
    }
  }, [mediaStreamMonitor, mediaStreamTracks, previousMediaStreamTracks]);

  return percent;
}
