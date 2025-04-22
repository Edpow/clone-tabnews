import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("GET /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("Retrieving users", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users");

      expect(response.status).toBe(200);
    });
  });
});
