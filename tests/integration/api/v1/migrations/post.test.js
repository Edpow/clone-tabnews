import webserver from "infra/webserver";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("POST /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
        });
        expect(response.status).toBe(403);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar esta ação",
          action: "Verifique se o seu usuário possui a feture run:migration",
          status_code: 403,
        });
      });

      test("For the second time", async () => {
        const response2 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
        });

        expect(response2.status).toBe(403);

        const responseBody = await response2.json();

        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar esta ação",
          action: "Verifique se o seu usuário possui a feture run:migration",
          status_code: 403,
        });
      });
    });
  });

  describe("Defatult user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const user = await orchestrator.createUser();
        await orchestrator.activateUser(user);
        const userSessionObject = await orchestrator.createSession(user);

        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
          Cookie: `session_id=${userSessionObject.token}`,
        });
        expect(response.status).toBe(403);

        const responseBody = await response.json();

        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar esta ação",
          action: "Verifique se o seu usuário possui a feture run:migration",
          status_code: 403,
        });
      });

      test("For the second time", async () => {
        const user = await orchestrator.createUser();
        await orchestrator.activateUser(user);
        const userSessionObject = await orchestrator.createSession(user);

        const response2 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "POST",
          Cookie: `session_id=${userSessionObject.token}`,
        });

        expect(response2.status).toBe(403);

        const responseBody = await response2.json();

        expect(responseBody).toEqual({
          name: "ForbiddenError",
          message: "Você não possui permissão para executar esta ação",
          action: "Verifique se o seu usuário possui a feture run:migration",
          status_code: 403,
        });
      });
    });
  });

  describe("Authenticated user with `run:migration` feature", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const user = await orchestrator.createUser();
        await orchestrator.activateUser(user);
        await orchestrator.addFeaturesToUser(user, ["run:migration"]);
        const userSessionObject = await orchestrator.createSession(user);

        const response = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "post",
          headers: {
            Cookie: `session_id=${userSessionObject.token}`,
          },
        });

        const responseBody = await response.json();
        expect(response.status).toBe(200);
        expect(responseBody).toEqual([]);
      });

      test("For the second time", async () => {
        const user = await orchestrator.createUser();
        await orchestrator.activateUser(user);
        await orchestrator.addFeaturesToUser(user, ["run:migration"]);
        const userSessionObject = await orchestrator.createSession(user);

        const response2 = await fetch(`${webserver.origin}/api/v1/migrations`, {
          method: "post",
          headers: {
            Cookie: `session_id=${userSessionObject.token}`,
          },
        });

        const responseBody = await response2.json();
        expect(response2.status).toBe(200);
        expect(responseBody).toEqual([]);
      });
    });
  });
});
