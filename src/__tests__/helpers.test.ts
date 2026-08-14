import { calculateMinReceive, calculateRate, fromStroops, toStroops } from "../helpers";

describe("helpers", () => {
  it("calculates min receive with slippage", () => {
    expect(calculateMinReceive(100, 0.5)).toBe(99.5);
    expect(calculateMinReceive("10", 1)).toBe(9.9);
  });

  it("calculates swap rates", () => {
    const result = calculateRate(2, 10, { decimals: 2 });
    expect(result.rate).toBe(5);
    expect(result.invertedRate).toBe(0.2);
    expect(result.formatted).toBe("5.00");
  });

  it("converts stroops", () => {
    expect(toStroops(1)).toBe(10_000_000);
    expect(fromStroops(10_000_000)).toBe(1);
  });
});
