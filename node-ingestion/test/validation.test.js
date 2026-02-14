const { validateHeartRate } = require("../src/validator"); // We will create this

describe("Health Data Validation", () => {
  test("should accept valid heart rate data", () => {
    const result = validateHeartRate(75);
    expect(result).toBe(true);
  });

  test("should reject extreme heart rate values", () => {
    expect(validateHeartRate(0)).toBe(false);
    expect(validateHeartRate(300)).toBe(false);
  });

  test("should reject non-numeric values", () => {
    expect(validateHeartRate("high")).toBe(false);
    expect(validateHeartRate(null)).toBe(false);
  });
});
