/**
 * Runs before any test file. Ensures DATABASE_URL is set before modules load dotenv.
 */
process.env.NODE_ENV = "test";
process.env.ENABLE_SWAGGER = "false";
if (!process.env.TEST_DATABASE_URL) {
  process.env.TEST_DATABASE_URL =
    "postgresql://postgres:postgres@127.0.0.1:5432/autocurso_test";
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
if (!process.env.ADMIN_API_KEY) {
  process.env.ADMIN_API_KEY = "test-admin-api-key-16+";
}
