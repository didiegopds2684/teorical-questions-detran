import { describe, expect, it } from "vitest";
import { HttpError, isHttpError } from "./http-error.js";

describe("HttpError", () => {
  it("identifies HttpError instances", () => {
    const e = new HttpError(404, "NOT_FOUND", "missing");
    expect(isHttpError(e)).toBe(true);
    expect(isHttpError(new Error("x"))).toBe(false);
  });
});
