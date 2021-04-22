/**
 * Utility functions which manage multiple MediaStream instances /
 * MediaStreamTrack associations and container querying.
 */

/**
 * Determines whether the given MediaStream is in the given list.
 *
 * @param {MediaStream} mediaStream
 * @param {MediaStream[]} mediaStreamList
 * @return {boolean}
 */
export function getListHasMediaStream(mediaStream, mediaStreamList) {
  const cachedMediaStream = mediaStreamList.find(
    ({ id }) => id === mediaStream.id
  );

  if (cachedMediaStream) {
    return true;
  } else {
    return false;
  }
}

/**
 * Determines container MediaStream from given MediaStreamTrack.
 *
 * Note, if the same MediaStreamTrack were to be encased in more than one
 * MediaStream, only the first MediaStream will be returned.
 *
 * @param {MediaStream} mediaStream
 * @param {MediaStream[]} mediaStreamList
 * @return {MediaStream}
 */
export function getTrackMediaStream(mediaStreamTrack, mediaStreamList) {
  const msid = mediaStreamTrack.id;

  for (const mediaStream of mediaStreamList) {
    const testMsids = mediaStream.getTracks().map(({ id }) => id);

    if (testMsids.includes(msid)) {
      return mediaStream;
    }
  }
}

/**
 * Adds a MediaStream to the given list.
 *
 * If the MediaStream is already present in the list, it ignores the new
 * stream.
 *
 * @param {MediaStream} mediaStream
 * @param {MediaStream[]} mediaStreamList
 * @return {MediaStream[]} Returns copied version of the list
 * (original is not modified).
 */
export function addMediaStreamToList(mediaStream, mediaStreamList) {
  if (!(mediaStream instanceof MediaStream)) {
    throw new Error("mediaStream is not of MediaStream type");
  }

  // Remove the original MediaStream, and add a new one, even if it has the
  // same id.
  //
  // NOTE (jh): This seems necessary, or the new tracks can be orphaned over
  // WebRTC.
  const copy = [...mediaStreamList].filter(({ id }) => mediaStream.id !== id);
  copy.push(mediaStream);

  return copy;
}

/**
 * Removes a MediaStream from the given list.
 *
 * @param {MediaStream} mediaStream
 * @param {MediaStream[]} mediaStreamList
 * @return {MediaStream[]} Returns copied version of the list
 * (original is not modified).
 */
export function removeMediaStreamFromList(mediaStream, mediaStreamList) {
  if (!(mediaStream instanceof MediaStream)) {
    throw new Error("mediaStream is not of MediaStream type");
  }

  return mediaStreamList.filter(({ id }) => id !== mediaStream.id);
}

/**
 * From the given MediaStream list, retrieves all of the MediaStreamTrack
 * instances.
 *
 * @param {MediaStream[]} mediaStreamList
 * @param {number[]} filterToMediaStreamIds?
 * @return {MediaStreamTrack[]}
 */
export function getMediaStreamListTracks(
  mediaStreamList,
  filterToMediaStreamIds = []
) {
  const tracks = [];

  const filteredMediaStreamList = mediaStreamList.filter(({ id }) =>
    !filterToMediaStreamIds.length ? true : filterToMediaStreamIds.includes(id)
  );

  for (const mediaStream of filteredMediaStreamList) {
    for (const mediaStreamTrack of mediaStream.getTracks()) {
      tracks.push(mediaStreamTrack);
    }
  }

  return tracks;
}
