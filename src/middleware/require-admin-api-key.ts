import type { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env.js";
import { HttpError } from "../common/http-error.js";

function extractBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) {
    const t = h.slice("Bearer ".length).trim();
    return t || null;
  }
  const x = req.headers["x-admin-key"];
  if (typeof x === "string" && x.trim()) return x.trim();
  return null;
}

export function requireAdminApiKey(req: Request, _res: Response, next: NextFunction): void {
  const key = extractBearer(req);
  const expected = getEnv().ADMIN_API_KEY;
  if (!key || key !== expected) {
    next(new HttpError(401, "UNAUTHORIZED", "Invalid or missing admin credentials"));
    return;
  }
  next();
}
