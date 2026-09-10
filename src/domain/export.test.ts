import { describe, expect, it } from "vitest";
import { csvCell, compositionCsv } from "./export";
describe("CSV", () => {
  it("neutraliza fórmulas", () => { expect(csvCell("=1+1")).toBe('"\'=1+1"'); expect(csvCell('A"B')).toBe('"A""B"'); });
  it("inclui BOM para Excel", () => { expect(compositionCsv([]).startsWith('\uFEFF')).toBe(true); });
});
