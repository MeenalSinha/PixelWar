/**
 * These are REAL integration tests against the actual Express app and a real
 * DynamoDB Local instance — not mocked unit tests. They require:
 *
 *   1. `docker-compose up -d` in /infra (DynamoDB Local on :8000)
 *   2. `npm run create-tables` (creates PixelWarTable + GSIs)
 *   3. NODE_ENV=test npm test
 *
 * Honesty note: these tests were written and syntax-checked in the same
 * environment that built this repo, but that environment has no Docker
 * available, so they have NOT been executed end-to-end here. Anyone running
 * them for the first time should treat the first run as the actual
 * verification step, not assume it from this comment.
 */
module.exports = {
  testEnvironment: "node",
  testTimeout: 30000,
  testMatch: ["**/tests/**/*.test.js"],
};
