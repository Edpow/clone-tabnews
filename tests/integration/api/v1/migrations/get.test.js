import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("GET /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(`${webserver.origin}/api/v1/migrations`);

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture read:migration",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const user = await orchestrator.createUser();
      await orchestrator.activateUser(user);
      const userSessionObject = await orchestrator.createSession(user);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${userSessionObject.token}`,
        },
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture read:migration",
        status_code: 403,
      });
    });
  });

  describe("Authenticated user with `read:migration` feature", () => {
    test("Retrieving pending migrations", async () => {
      const user = await orchestrator.createUser();
      await orchestrator.activateUser(user);
      const userSessionObject = await orchestrator.createSession(user);
      await orchestrator.addFeaturesToUser(user, ["read:migration"]);

      const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
        headers: {
          Cookie: `session_id=${userSessionObject.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(Array.isArray(responseBody)).toBe(true);

      expect(responseBody.length).toBe(0);
    });
  });
});
