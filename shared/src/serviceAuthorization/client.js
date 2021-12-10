import SparkMD5 from "spark-md5";

const CLIENT_SOFTWARE_HASH = process.env.REACT_APP_GIT_HASH;

// TODO: Rename
/**
 * Adapts the cached authorization, which also contains the client identity, to
 * be transmitted to the backend.
 *
 * IMPORTANT: This should only be used between client and server and nothing
 * else!
 *
 * @param {string} clientPublicKey
 * @param {string} clientDeviceAddress
 * @return {Object}
 */
export function generateClientAuthentication(
  clientPublicKey,
  clientDeviceAddress
) {
  const anticipatedServerSoftwareHash = CLIENT_SOFTWARE_HASH;

  return {
    clientPublicKey,

    // TODO: Use SHA-256?
    clientDeviceAddressHash: SparkMD5.hash(clientDeviceAddress),

    clientSoftwareHash: CLIENT_SOFTWARE_HASH,

    // TODO: Use SHA-256?
    clientHash: SparkMD5.hash(
      `${clientPublicKey}${clientDeviceAddress}${CLIENT_SOFTWARE_HASH}${anticipatedServerSoftwareHash}`
    ),
  };
}

// TODO: Document
export function validateClientAuthorization(
  clientAuthorization,
  clientPublicKey,
  clientDeviceAddress
) {
  if (
    clientAuthorization !==
    SparkMD5.hash(
      SparkMD5.hash(
        `${clientPublicKey}${clientDeviceAddress}${CLIENT_SOFTWARE_HASH}${CLIENT_SOFTWARE_HASH}`
      )
    )
  ) {
    throw new ReferenceError("Invalid client authorization");
  }
}
