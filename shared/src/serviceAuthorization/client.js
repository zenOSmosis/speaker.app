import SparkMD5 from "spark-md5";

/**
 * Client-side authentication method.
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
  const clientSoftwareHash = process.env.REACT_APP_GIT_HASH;
  const anticipatedServerSoftwareHash = clientSoftwareHash;

  // IMPORTANT: Not sending clientDeviceAddress itself (only a hash of it) to
  // the server. The server should be able to decode the clientDeviceAddress
  // from the clientPublicKey.
  return {
    clientPublicKey,

    // TODO: Use SHA-256?
    clientDeviceAddressHash: SparkMD5.hash(clientDeviceAddress),

    clientSoftwareHash: clientSoftwareHash,

    // TODO: Use SHA-256?
    clientHash: SparkMD5.hash(
      `${clientPublicKey}${clientDeviceAddress}${clientSoftwareHash}${anticipatedServerSoftwareHash}`
    ),
  };
}

/**
 * Client-side server response check (helps ensure the server is legit).
 *
 * @param {string} clientAuthorization Client authorization string as received
 * from server.
 * @param {string} clientPublicKey
 * @param {string} clientDeviceAddress
 * @return {void}
 * @throws {ReferenceError} Throws if validation is not successful.
 */
export function validateClientAuthorization(
  clientAuthorization,
  clientPublicKey,
  clientDeviceAddress
) {
  const clientSoftwareHash = process.env.REACT_APP_GIT_HASH;

  if (
    clientAuthorization !==
    // NOTE: The double-hashing is due to the server re-hashing its own version
    SparkMD5.hash(
      SparkMD5.hash(
        `${clientPublicKey}${clientDeviceAddress}${clientSoftwareHash}${clientSoftwareHash}`
      )
    )
  ) {
    throw new ReferenceError("Invalid client authorization");
  }
}
