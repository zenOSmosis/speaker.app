import VirtualServerVirtualParticipant from "./VirtualServerVirtualParticipant";

/*
describe("VirtualServerVirtualParticipant", () => {
  it("Adds and retrieves participants by their Socket.io IDs", () => {
    const vp1 = new VirtualServerVirtualParticipant("abc123", {
      foo: "bar",
    });

    const vp2 = new VirtualServerVirtualParticipant("abc123", {
      cat: "not-a-dog",
    });

    expect(vp1.getSocketIds()).toEqual(["abc123"]);

    const vp3 = new VirtualServerVirtualParticipant("def456", {
      abc: "123",
    });

    expect(vp1.getSocketIds()).toEqual(["abc123"]);
    expect(vp2.getSocketIds()).toEqual(["abc123"]);
    expect(vp3.getSocketIds()).toEqual(["def456"]);

    // vp1.addSocketId("aab124");

    // expect(vp1.getSocketIds()).toEqual(["abc123", "aab124"]);
    // expect(vp2.getSocketIds()).toEqual(["abc123", "aab124"]);
  });

  it("Removes Socket.io ID from participants", () => {
    const vp1 = new VirtualServerVirtualParticipant("981a", {
      foo: "bar",
    });

    vp1.addSocketId("ddd111");
    vp1.addSocketId("ddd222");
    vp1.addSocketId("ddd333");

    expect(vp1.getSocketIds()).toEqual([
      "981a",
      "ddd111",
      "ddd222",
      "ddd333",
    ]);

    vp1.removeSocketId("ddd222");

    expect(vp1.getSocketIds()).toEqual(["981a", "ddd111", "ddd333"]);
  });
});
*/
