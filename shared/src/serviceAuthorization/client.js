import SparkMD5 from "spark-md5";

/**
 * Adapts the cached authorization, which also contains the client identity, to
 * be transmitted to the backend.
 *
 * IMPORTANT: This should only be used between client and server and nothing
 * else!
 *
 * @param {Object} cachedAuthorization
 * @return {Object}
 */
export function sendCachedAuthorization(cachedAuthorization) {
  // Deep copy, so that we don't mutate the original object
  cachedAuthorization = JSON.parse(JSON.stringify(cachedAuthorization));

  const ret = {
    buildHash: process.env.REACT_APP_GIT_HASH,
  };

  if (
    cachedAuthorization &&
    cachedAuthorization.clientIdentity &&
    cachedAuthorization.clientIdentity.privateKey
  ) {
    // The client identity emit over the wire to the server
    ret.clientIdentity = {
      // TODO: Re-encrypt based on socket id as key?
      p: cachedAuthorization.clientIdentity.privateKey,

      // TODO: Use SHA-256?
      h: SparkMD5.hash(
        `${cachedAuthorization.clientIdentity.address}${cachedAuthorization.clientIdentity.publicKey}${cachedAuthorization.clientIdentity.privateKey}`
      ),
    };
  }

  return ret;
}

/**
 * Retrieves merged authorization of cached and received authorization.
 *
 * For existing clients, the received authorization will contain less data
 * than new clients.
 *
 * @param {Object} cachedAuthorization
 * @param {Object} receivedAuthorization
 * @return {Object}
 */
export function getMergedAuthorization(
  cachedAuthorization,
  receivedAuthorization
) {
  return {
    ...cachedAuthorization,
    ...receivedAuthorization,
    clientIdentity: {
      ...(cachedAuthorization.clientIdentity || {}),
      ...(receivedAuthorization.clientIdentity || {}),
    },
  };
}
