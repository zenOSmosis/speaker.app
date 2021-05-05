import DataChannelManager from "./ZenRTCPeer.DataChannelManagerModule";

describe("packs and unpacks channel data", () => {
  it("packs channel data", () => {
    expect(DataChannelManager.pack("some-channel-name", 123)).toEqual(
      "<z:some-channel-name,i,123/>",
      "handles integer values"
    );

    expect(DataChannelManager.pack("some-channel-name", 123.456)).toEqual(
      "<z:some-channel-name,f,123.456/>",
      "handles float values"
    );

    expect(DataChannelManager.pack("some-channel-name", { test: 123 })).toEqual(
      `<z:some-channel-name,o,\{\"test\":123\}/>`,
      "serializes object"
    );

    expect(
      DataChannelManager.pack("some-channel-name", [1, 2, 3, "test"])
    ).toEqual(`<z:some-channel-name,o,[1,2,3,"test"]/>`, "serializes array");
  });

  it("unpacks channel data", () => {
    expect(
      DataChannelManager.unpack(DataChannelManager.pack("test-channel", 123))
    ).toEqual(["test-channel", 123], "unpacks integer type");

    expect(
      DataChannelManager.unpack(
        DataChannelManager.pack("test-channel", 123.456)
      )
    ).toEqual(["test-channel", 123.456], "unpacks float type");

    expect(
      DataChannelManager.unpack(
        DataChannelManager.pack("test-channel", { foo: 123, test: "abc" })
      )
    ).toEqual(
      ["test-channel", { foo: 123, test: "abc" }],
      "unpacks object type"
    );

    expect(
      DataChannelManager.unpack(
        DataChannelManager.pack("test-channel", "stringy")
      )
    ).toEqual(["test-channel", "stringy"], "unpacks string type");

    expect(DataChannelManager.unpack("abc")).toEqual(
      undefined,
      "ignores invalid type"
    );
  });
});
