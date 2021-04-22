import { sendCachedAuthorization, getMergedAuthorization } from "./client";
import { receiveHandshakeAuthentication } from "./server";

describe("serviceAuthorization", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache

    process.env = {
      ...OLD_ENV,
      ...{
        REACT_APP_GIT_HASH: "1928a",
        GIT_HASH: "1928a",
      },
    }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  it("Authenticates new clients", () => {
    const authentication = sendCachedAuthorization({});

    const {
      clientAuthorization,
      clientDeviceAddress,
    } = receiveHandshakeAuthentication(authentication);

    expect(clientAuthorization).toHaveProperty("clientIdentity");
    expect(clientAuthorization.clientIdentity).toHaveProperty("address");
    expect(clientAuthorization.clientIdentity).toHaveProperty("publicKey");
    expect(clientAuthorization.clientIdentity).toHaveProperty("privateKey");

    expect(clientAuthorization.isExisting).toBe(false);
    expect(Boolean(clientDeviceAddress.length)).toBe(true);
  });

  it("Authenticates existing clients", () => {
    const cachedAuthorization = {
      serverBuildHash: "1928a",
      clientIdentity: {
        address: "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A",
        privateKey:
          "0x60e7037b1fed47faab56d0162e9f2a02081102dfc0089109dd79a2029f7adc6b",
        publicKey:
          "958fd7ccc86331d53106d7b20ad7b5c9b8ce7d29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
      },
      isExisting: false,
    };

    const authentication = sendCachedAuthorization(cachedAuthorization);

    const {
      clientAuthorization,
      clientDeviceAddress,
    } = receiveHandshakeAuthentication(authentication);

    expect(clientAuthorization.isExisting).toBe(true);
    expect(clientDeviceAddress).toBe(
      "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A"
    );

    // Ensure the received authorization matches the cached authorization, with
    // the exception of the isExisting flag being switched to true
    expect(
      getMergedAuthorization(cachedAuthorization, clientAuthorization)
    ).toStrictEqual({
      ...cachedAuthorization,
      ...{
        isExisting: true,
      },
    });
  });

  it("Errors when clients forge their signature", () => {
    const cachedAuthorizations = [
      // Modified address
      {
        serverBuildHash: "1928a",
        clientIdentity: {
          address: "0x7771E0A86557E8986AE53e58ABfF29B28a6D6b5A",
          privateKey:
            "0x60e7037b1fed47faab56d0162e9f2a02081102dfc0089109dd79a2029f7adc6b",
          publicKey:
            "958fd7ccc86331d53106d7b20ad7b5c9b8ce7d29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
        },
        isExisting: false,
      },

      // Modified private key
      {
        serverBuildHash: "1928a",
        clientIdentity: {
          address: "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A",
          privateKey:
            "0x60e7037b1fed47faab56d0162e9f2a02091102dfc0089109dd79a2029f7adc6b",
          publicKey:
            "958fd7ccc86331d53106d7b20ad7b5c9b8ce7d29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
        },
        isExisting: false,
      },

      // Modified public key
      {
        serverBuildHash: "1928a",
        clientIdentity: {
          address: "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A",
          privateKey:
            "0x60e7037b1fed47faab56d0162e9f2a02081102dfc0089109dd79a2029f7adc6b",
          publicKey:
            "958fd7ccc86331d53106d7b20ad7b5c9b8ce7e29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
        },
        isExisting: false,
      },
    ];

    for (const cachedAuthorization of cachedAuthorizations) {
      const authentication = sendCachedAuthorization(cachedAuthorization);

      expect(() => receiveHandshakeAuthentication(authentication)).toThrow(
        "Invalid checksum"
      );
    }
  });

  /*
  it("Errors if client build hash does not match server build hash", () => {
    expect(() =>
      receiveHandshakeAuthentication({
        buildHash: "a9348",
      })
    ).toThrow("Client build hash does not match server");
  });
  */
});
