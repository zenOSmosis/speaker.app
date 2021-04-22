import SocketAPIClient from "./SocketAPIClient";

// const _fetchMap = new Map()

/**
 * @param {string} apiName
 * @param {Object} requestData [optional]
 * @return {Promise<Object>} requestResponse; TODO: Document
 */
export default function fetch(apiName, requestData = {}) {
  return new Promise((resolve, reject) => {
    // TODO: Replace this w/ a shorter hash
    //
    // const debounceId = JSON.stringify(apiName, requestData)
    // const cachedFetch = _fetchMap.get(debounceId)

    const socket = SocketAPIClient.getSocket();

    socket.emit(apiName, requestData, ([err, resp]) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(resp);
      }
    });
  });
}
