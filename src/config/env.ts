import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Railway injects PORT; an empty string would coerce to 0 and fail — treat as unset
  PORT: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.coerce.number().int().positive().default(3000),
  ),
  DATABASE_URL: z
    .string()
    .min(1)
    .refine((s) => s.startsWith("postgres"), "DATABASE_URL must be a PostgreSQL connection string"),
  ENABLE_SWAGGER: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => v !== "false"),
  QUESTIONS_JSON_PATH: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  return {
    ...parsed.data,
    ENABLE_SWAGGER: parsed.data.ENABLE_SWAGGER ?? true,
  };
}

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
}
