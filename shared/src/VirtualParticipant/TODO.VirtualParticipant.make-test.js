import VirtualParticipant from "./VirtualParticipant";

/*
describe("VirtualParticipant", () => {
  it("Combines new virtual participants same Socket.io IDs", () => {
    const vp1 = new VirtualParticipant("abc123", {
      foo: "bar",
    });

    const vp2 = new VirtualParticipant("abc123", {
      cat: "not-a-dog",
    });

    expect(vp1.getState()).toEqual(vp2.getState());

    const vp3 = new VirtualParticipant("def456", {
      abc: "123",
    });

    expect(vp1.getState()).not.toEqual(vp3.getState());

    const vp4 = new VirtualParticipant("abc123", {
      abc: "123",
    });

    expect(vp1.getState()).toEqual(vp4.getState());

    expect(vp4.getState()).toMatchObject({
      abc: "123",
      avatarURL: null,
      cat: "not-a-dog",
      description: null,
      detectedDevice: {},
      deviceAddress: null,
      foo: "bar",
      isMuted: true,
      media: {},
      socketIoIds: ["abc123"],
    });
  });
});
*/
