import EthCrypto from "eth-crypto";
import SparkMD5 from "spark-md5";

/**
 * Server-side client authentication method.
 *
 * TODO: Document types
 * @param {Object} clientAuthentication
 * @return {Object}
 */
export function receiveClientAuthentication(clientAuthentication) {
  console.log("Validating client identity");

  const {
    clientPublicKey,
    clientDeviceAddressHash,
    clientSoftwareHash,
    clientHash,
  } = clientAuthentication;

  const clientDeviceAddress = EthCrypto.publicKey.toAddress(clientPublicKey);

  // TODO: Use SHA-256?
  if (clientDeviceAddressHash !== SparkMD5.hash(clientDeviceAddress)) {
    throw new ReferenceError("clientDeviceAddressHash is incorrect");
  }

  const serverSoftwareHash = process.env.GIT_HASH;

  // IMPORTANT: While this can be improved, it locks the checksum against the
  // server version, so as new updates become available, the client will not be
  // able to authenticate with the server, and will need to update /
  // reauthenticate
  //
  // TODO: Use SHA-256?
  const serverChecksumHash = SparkMD5.hash(
    `${clientPublicKey}${clientDeviceAddress}${clientSoftwareHash}${serverSoftwareHash}`
  );

  if (serverChecksumHash !== clientHash) {
    throw new ReferenceError("Server checksum hash does not match clientHash");
  }

  console.log("Client identity validated");

  return {
    // Re-encode server checksum hash
    clientAuthorization: SparkMD5.hash(serverChecksumHash),
    clientDeviceAddress,
  };
}
