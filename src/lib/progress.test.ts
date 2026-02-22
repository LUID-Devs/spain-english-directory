import { describe, expect, it } from "vitest";
import { getProgressState } from "./progress";

describe("getProgressState", () => {
  it("returns percentage based on max", () => {
    const state = getProgressState(25, 50);
    expect(state.percentage).toBe(50);
    expect(state.clampedValue).toBe(25);
    expect(state.max).toBe(50);
  });

  it("clamps values above max", () => {
    const state = getProgressState(120, 100);
    expect(state.percentage).toBe(100);
    expect(state.clampedValue).toBe(100);
  });

  it("clamps negative values to zero", () => {
    const state = getProgressState(-10, 100);
    expect(state.percentage).toBe(0);
    expect(state.clampedValue).toBe(0);
  });

  it("handles non-positive max", () => {
    const state = getProgressState(10, 0);
    expect(state.percentage).toBe(0);
    expect(state.clampedValue).toBe(0);
    expect(state.max).toBe(0);
  });
});
