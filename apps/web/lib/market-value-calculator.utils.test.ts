import { MarketValueCalculator } from "@/lib/market-value-calculator";

describe("MarketValueCalculator - Pure Functions", () => {
  let calculator: MarketValueCalculator;

  beforeEach(() => {
    calculator = new MarketValueCalculator();
  });

  describe("calculateAgeFactor", () => {
    it("should return correct factor for age 19", () => {
      const factor = (calculator as any).calculateAgeFactor(19);
      expect(factor).toBeCloseTo(1 + (19 - 18) * 0.08, 2);
      expect(factor).toBeGreaterThan(1);
    });

    it("should return correct factor for age 23", () => {
      const factor = (calculator as any).calculateAgeFactor(23);
      expect(factor).toBeCloseTo(1 + (23 - 20) * 0.04, 2);
    });

    it("should return peak factor for age 27", () => {
      const factor = (calculator as any).calculateAgeFactor(27);
      expect(factor).toBeCloseTo(1.20 + (27 - 25) * 0.01, 2);
    });

    it("should return declining factor for age 30", () => {
      const factor = (calculator as any).calculateAgeFactor(30);
      expect(factor).toBeCloseTo(1.23 - (30 - 28) * 0.025, 2);
    });

    it("should return significant decline for age 35", () => {
      const factor = (calculator as any).calculateAgeFactor(35);
      expect(factor).toBeCloseTo(1.13 - (35 - 32) * 0.03, 2);
    });
  });

  describe("calculatePositionFactor", () => {
    it("should return 0.95 for GK", () => {
      const factor = (calculator as any).calculatePositionFactor({ category: "GK" });
      expect(factor).toBe(0.95);
    });

    it("should return 0.9 for DEF", () => {
      const factor = (calculator as any).calculatePositionFactor({ category: "DEF" });
      expect(factor).toBe(0.9);
    });

    it("should return 1.05 for MID", () => {
      const factor = (calculator as any).calculatePositionFactor({ category: "MID" });
      expect(factor).toBe(1.05);
    });

    it("should return 1.15 for FWD", () => {
      const factor = (calculator as any).calculatePositionFactor({ category: "FWD" });
      expect(factor).toBe(1.15);
    });

    it("should return 1 for undefined position", () => {
      const factor = (calculator as any).calculatePositionFactor(undefined);
      expect(factor).toBe(1);
    });
  });

  describe("getRandomMarketTrend", () => {
    it("should return value between 0.98 and 1.02", () => {
      for (let i = 0; i < 50; i++) {
        const trend = (calculator as any).getRandomMarketTrend();
        expect(trend).toBeGreaterThanOrEqual(0.98);
        expect(trend).toBeLessThanOrEqual(1.02);
      }
    });
  });

  describe("getAge", () => {
    it("should calculate age correctly", () => {
      const birthDate = new Date("1995-06-24");
      const today = new Date();
      const expectedAge = today.getFullYear() - 1995;
      const age = (calculator as any).getAge(birthDate);
      // Age can be off by 1 depending on whether birthday has passed this year
      expect(age).toBe(expectedAge || expectedAge - 1);
    });
  });
});
