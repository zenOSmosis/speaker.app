import PhantomBase from "./PhantomBase";

describe("PhantomBase", () => {
  it("Determines if same instance", () => {
    const a = new PhantomBase();

    const b = new PhantomBase();

    const c = a;

    const d = b;

    expect(a.getIsSameInstance(b)).toBe(false);
    expect(a.getUuid()).not.toBe(b.getUuid());

    expect(b.getIsSameInstance(c)).toBe(false);
    expect(b.getUuid()).not.toBe(c.getUuid());

    expect(c.getIsSameInstance(a)).toBe(true);
    expect(c.getUuid()).toBe(a.getUuid());

    expect(d.getIsSameInstance(b)).toBe(true);
    expect(d.getUuid()).toBe(b.getUuid())
  });
});
