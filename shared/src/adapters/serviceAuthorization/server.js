import EthCrypto from "eth-crypto";
import SparkMD5 from "spark-md5";
/**
 * @param {Object} handshakeAuthentication
 * @return {Object}
 */
export function receiveHandshakeAuthentication(handshakeAuthentication) {
  const SERVER_BUILD_HASH = process.env.GIT_HASH;

  // Existing client identity, if exists
  const clientIdentity = handshakeAuthentication.clientIdentity;

  // TODO: Implement server-side build hash checking later
  //
  // Ensure the client is running the latest version of the software
  /*
  if (handshakeAuthentication.buildHash !== SERVER_BUILD_HASH) {
    // TODO: Use an extended error type
    throw new Error("Client build hash does not match server");
  }
  */

  // Base authorization object
  const clientAuthorization = {
    serverBuildHash: SERVER_BUILD_HASH,
  };

  let clientDeviceAddress = null;

  if (clientIdentity) {
    console.log("Validating existing client");

    const privateKey = clientIdentity.p;
    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const address = EthCrypto.publicKey.toAddress(publicKey);

    clientDeviceAddress = address;

    const clientHash = clientIdentity.h;

    // TODO: Use SHA-256?
    const ourChecksumHash = SparkMD5.hash(
      `${address}${publicKey}${privateKey}`
    );

    if (clientHash !== ourChecksumHash) {
      throw new Error("Invalid checksum");
    }

    clientAuthorization.isExisting = true;

    console.log("Existing client validated!");
  } else {
    console.log("Generating new client identity");
    clientAuthorization.clientIdentity = EthCrypto.createIdentity();
    clientDeviceAddress = clientAuthorization.clientIdentity.address;
    console.log("Client identity generated");

    clientAuthorization.isExisting = false;
  }

  return {
    clientAuthorization,
    clientDeviceAddress,
  };
}
