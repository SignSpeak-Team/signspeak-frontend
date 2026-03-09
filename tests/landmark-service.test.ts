import { LandmarkService } from "../services/landmark-service";
import { HandLandmarks } from "../types/types";

// Helper: build a valid set of 21 landmarks
const buildValidLandmarks = (): HandLandmarks =>
  Array.from({ length: 21 }, (_, i) => [i * 0.05, i * 0.05, 0]);

describe("LandmarkService.validateLandmarks()", () => {
  it("should return true for a valid set of 21 landmarks", () => {
    const landmarks = buildValidLandmarks();
    expect(LandmarkService.validateLandmarks(landmarks)).toBe(true);
  });

  it("should return false when fewer than 21 landmarks are provided", () => {
    const landmarks: HandLandmarks = Array.from({ length: 10 }, () => [
      0, 0, 0,
    ]);
    expect(LandmarkService.validateLandmarks(landmarks)).toBe(false);
  });

  it("should return false when more than 21 landmarks are provided", () => {
    const landmarks: HandLandmarks = Array.from({ length: 25 }, () => [
      0, 0, 0,
    ]);
    expect(LandmarkService.validateLandmarks(landmarks)).toBe(false);
  });

  it("should return false when a landmark has fewer than 3 coordinates", () => {
    const landmarks = buildValidLandmarks();
    (landmarks[0] as any) = [0.5, 0.5]; // only x, y
    expect(LandmarkService.validateLandmarks(landmarks)).toBe(false);
  });

  it("should return false when a landmark contains a non-numeric value", () => {
    const landmarks = buildValidLandmarks();
    (landmarks[5] as any) = [0.1, "bad", 0.0];
    expect(LandmarkService.validateLandmarks(landmarks)).toBe(false);
  });

  it("should return false when the input is not an array", () => {
    expect(LandmarkService.validateLandmarks(null as any)).toBe(false);
    expect(LandmarkService.validateLandmarks("string" as any)).toBe(false);
  });

  it("should accept landmarks with negative coordinate values (valid range)", () => {
    const landmarks: HandLandmarks = Array.from({ length: 21 }, () => [
      -0.1, -0.2, -0.05,
    ]);
    expect(LandmarkService.validateLandmarks(landmarks)).toBe(true);
  });
});
