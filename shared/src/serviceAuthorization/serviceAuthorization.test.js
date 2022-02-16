import {
  generateClientAuthentication,
  validateClientAuthorization,
} from "./client";
import { receiveClientAuthentication } from "./server";

describe("serviceAuthorization", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    // Most important - it clears the cache
    jest.resetModules();

    process.env = {
      ...OLD_ENV,
      ...{
        REACT_APP_GIT_HASH: "1928a",
        GIT_HASH: "1928a",
      },
    }; // Make a copy
  });

  afterAll(() => {
    // Restore old environment
    process.env = OLD_ENV;
  });

  it("Authenticates clients", () => {
    const clientPublicKey =
      "958fd7ccc86331d53106d7b20ad7b5c9b8ce7d29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f";
    const clientDeviceAddress = "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A";

    const clientAuthentication = generateClientAuthentication(
      clientPublicKey,
      clientDeviceAddress
    );

    const {
      clientAuthorization,
      clientDeviceAddress: authorizationClientDeviceAddress,
    } = receiveClientAuthentication(clientAuthentication);

    expect(authorizationClientDeviceAddress).toBe(
      "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A"
    );

    expect(
      validateClientAuthorization(
        clientAuthorization,
        clientPublicKey,
        clientDeviceAddress
      )
    ).toBe(undefined);
  });

  it("Errors when clients forge their signature", () => {
    const mockClientIdentities = [
      // Modified address
      {
        clientDeviceAddress: "0x7771E0A86557E8986AE53e58ABfF29B28a6D6b5A",
        clientPrivateKey:
          "0x60e7037b1fed47faab56d0162e9f2a02081102dfc0089109dd79a2029f7adc6b",
        clientPublicKey:
          "958fd7ccc86331d53106d7b20ad7b5c9b8ce7d29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
      },

      // Modified private key
      /*
      {
        clientDeviceAddress: "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A",
        clientPrivateKey:
          "0x60e7037b1fed47faab56d0162e9f2a02091102dfc0089109dd79a2029f7adc6b",
        clientPublicKey:
          "958fd7ccc86331d53106d7b20ad7b5c9b8ce7d29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
      },
      */

      // Modified public key
      {
        clientDeviceAddress: "0x7771E0A86557E8986AE53e58ABeF29B28a6D6b5A",
        clientPrivateKey:
          "0x60e7037b1fed47faab56d0162e9f2a02081102dfc0089109dd79a2029f7adc6b",
        clientPublicKey:
          "958fd7ccc86331d53106d7b20ad7b5c9b8ce7e29fef3853d8cf4e33f887977158f17ad7e67673419bcb00d2f1bbff641277f26509c2e39cdda1adacd9866c50f",
      },
    ];

    for (const {
      clientDeviceAddress,
      // clientPrivateKey,
      clientPublicKey,
    } of mockClientIdentities) {
      const clientAuthentication = generateClientAuthentication(
        clientPublicKey,
        clientDeviceAddress
      );

      expect(() => receiveClientAuthentication(clientAuthentication)).toThrow();
    }
  });
});
