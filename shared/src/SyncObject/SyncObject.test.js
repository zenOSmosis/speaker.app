import SyncObject from "./SyncObject";

describe("SyncObect", () => {
  it("Does not allow functions to be applied as state", () => {
    expect(
      () =>
        new SyncObject({
          a: () => console.log("hello"),
        })
    ).toThrow(`Key "a" is not serializable`);

    const sync = new SyncObject({
      a: null,
    });

    expect(() =>
      sync.setState({
        a: () => console.log("hello"),
      })
    ).toThrow();
  });

  it("Allows undefined, null, and boolean false values", () => {
    const syncObject = new SyncObject({
      a: undefined,
      b: null,
      c: false,
    });

    expect(syncObject.getStateHashes()).toEqual({
      b: "37a6259cc0c1dae299a7866489dff0bd",
      c: "68934a3e9455fa72420237eb05902327",
    });
  });

  it("Instantiates and retrieves hashes", () => {
    const sync = new SyncObject({
      foo: 123,
      a: true,
      b: false,
      c: "some string",
      d: null,
    });

    expect(sync.getStateHashes()).toEqual({
      foo: "202cb962ac59075b964b07152d234b70",
      a: "b326b5062b2f0e69046810717534cb09",
      b: "68934a3e9455fa72420237eb05902327",
      c: "5ac749fbeec93607fc28d666be85e73a",
      d: "37a6259cc0c1dae299a7866489dff0bd",
    });
  });

  it("Retrieves key differences", () => {
    const sync = new SyncObject({
      foo: 123,
      a: true,
      b: false,
      c: "some string",
      d: null,
    });

    expect(
      sync
        .getDiffKeys({
          foo: "a02cb962ac59075b964b07152d234b70",
          a: "b326b5062b2f0e69046810717534cb09",
          b: "68934a3e9455fa72420237eb05902327",
          c: "1ac749fbeec93607fc28d666be85e73a",
          d: "37a6259cc0c1dae299a7866489dff0bd",
        })
        .sort()
    ).toEqual(["c", "foo"]);
  });

  it("Retrieves value differences", () => {
    const sync = new SyncObject({
      foo: 123,
      a: true,
      b: false,
      c: "some string",
      d: null,
    });

    expect(
      sync.getDiffValues({
        foo: "302cb962ac59075b964b07152d234b70",
        a: "b326b5062b2f0e69046810717534cb09",
        b: "68934a3e9455fa72420237eb05902327",
        c: "aac749fbeec93607fc28d666be85e73a",
        d: "37a6259cc0c1dae299a7866489dff0bd",
      })
    ).toEqual({
      c: "some string",
      foo: 123,
    });
  });

  it("Retrieves full state hash", () => {
    const sync = new SyncObject({
      foo: 123,
      a: true,
      b: false,
      c: "some string",
      d: null,
    });

    expect(sync.getFullStateHash()).toEqual("4423ce50690068c902324dd1a0773446");
  });
});
