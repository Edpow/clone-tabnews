import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("GET /api/v1/status", () => {
  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/status`);
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        dependencies: {
          database: {
            max_connections: 100,
            opened_connections: 1,
          },
        },
        updated_at: responseBody.updated_at,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving current system status", async () => {
      const user = await orchestrator.createUser();
      await orchestrator.activateUser(user);
      const userSessionObject = await orchestrator.createSession(user);
      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${userSessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        dependencies: {
          database: {
            max_connections: 100,
            opened_connections: 1,
          },
        },
        updated_at: responseBody.updated_at,
      });
    });
  });

  describe("Authenticated user with `read:status` feature", () => {
    test("Retrieving current system status", async () => {
      const user = await orchestrator.createUser();
      await orchestrator.activateUser(user);
      const userSessionObject = await orchestrator.createSession(user);
      await orchestrator.addFeaturesToUser(user, ["read:status"]);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${userSessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody.updated_at).toBeDefined();
      const responseDate = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBe(responseDate);

      expect(responseBody.dependencies.database.server_version).toBeUndefined();

      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBe(100);

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toBe(1);
    });
  });

  describe("Authenticated user with `read:status:all` feature", () => {
    test("Retrieving current system status", async () => {
      const user = await orchestrator.createUser();
      await orchestrator.activateUser(user);
      const userSessionObject = await orchestrator.createSession(user);
      await orchestrator.addFeaturesToUser(user, [
        "read:status",
        "read:status:all",
      ]);

      const response = await fetch(`${webserver.origin}/api/v1/status`, {
        headers: {
          Cookie: `session_id=${userSessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody.updated_at).toBeDefined();
      const responseDate = new Date(responseBody.updated_at).toISOString();
      expect(responseBody.updated_at).toBe(responseDate);

      expect(responseBody.dependencies.database.server_version).toBeDefined();

      expect(responseBody.dependencies.database.max_connections).toBeDefined();
      expect(responseBody.dependencies.database.max_connections).toBe(100);

      expect(
        responseBody.dependencies.database.opened_connections,
      ).toBeDefined();
      expect(responseBody.dependencies.database.opened_connections).toBe(1);
    });
  });
});
