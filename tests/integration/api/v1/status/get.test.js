import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/status");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody.updated_at).toBeDefined();
      const responseDate = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBe(responseDate);

      expect(responseBody.dependencies.server_version).toBeDefined();

      expect(responseBody.dependencies.max_connections).toBeDefined();
      expect(responseBody.dependencies.max_connections).toBe(100);

      expect(responseBody.dependencies.opened_connections).toBeDefined();
      expect(responseBody.dependencies.opened_connections).toBe(1);
    });
  });
});
