import password from "models/password";
import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "uniqueUser1",
        email: "uniqueUser1@email.com",
        password: "123456",
      });

      await orchestrator.activateUser(createdUser);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueUser1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUser2",
          }),
        },
      );

      expect(response2.status).toBe(403);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });

    test("With unique 'email'", async () => {
      await orchestrator.createUser({
        username: "uniqueEmail1",
        email: "uniqueEmail1@email.com",
        password: "123456",
      });

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmail1",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@email.com",
          }),
        },
      );

      expect(response2.status).toBe(403);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "123456",
      });

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "123456789",
          }),
        },
      );

      expect(response2.status).toBe(403);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });

    test("With non existent 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuario2",
        { method: "PATCH" },
      );

      expect(response.status).toBe(403);

      const responseBody2 = await response.json();

      expect(responseBody2).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody2 = await response.json();

      expect(responseBody2).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });

    test("With 'username' case mismatch", async () => {
      await orchestrator.createUser({
        username: "user1Mismatch",
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/user1Mismatch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "User1Mismatch",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody2 = await response.json();

      expect(responseBody2).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@email.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@email.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email2@email.com",
          }),
        },
      );

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para executar esta ação",
        action: "Verifique se o seu usuário possui a feture update:user",
        status_code: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With unique 'username'", async () => {
      const createdUser = await orchestrator.createUser({
        username: "defaultUser",
        email: "defaultuser@email.com",
        password: "123456",
      });

      await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/defaultUser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "defaultUser2",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: "defaultUser2",
        email: "defaultuser@email.com",
        features: ["create:session", "read:session", "update:user"],
        password: responseBody2.password,
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
      });

      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.updated_at)).not.toBeNaN();
      expect(responseBody2.updated_at > responseBody2.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user = await orchestrator.createUser({
        username: "uniqueEmailUsername",
        email: "uniqueEmailUsername1@email.com",
        password: "123456",
      });

      await orchestrator.activateUser(user);
      const sessionObject = await orchestrator.createSession(user.id);

      const response2 = await fetch(
        "http://localhost:3000/api/v1/users/uniqueEmailUsername",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            email: "uniqueEmailUsername2@email.com",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: "uniqueEmailUsername",
        email: "uniqueEmailUsername2@email.com",
        features: ["create:session", "read:session", "update:user"],
        password: responseBody2.password,
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
      });

      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.updated_at)).not.toBeNaN();
      expect(responseBody2.updated_at > responseBody2.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const createdUser = await orchestrator.createUser({
        password: "123456",
      });

      await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response2 = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            password: "123456789",
          }),
        },
      );

      expect(response2.status).toBe(200);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        id: responseBody2.id,
        username: createdUser.username,
        email: createdUser.email,
        features: ["create:session", "read:session", "update:user"],
        password: responseBody2.password,
        created_at: responseBody2.created_at,
        updated_at: responseBody2.updated_at,
      });

      expect(uuidVersion(responseBody2.id)).toBe(4);
      expect(Date.parse(responseBody2.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody2.updated_at)).not.toBeNaN();
      expect(responseBody2.updated_at > responseBody2.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);
      const correctPaswordMatch = await password.compare(
        "123456789",
        userInDatabase.password,
      );

      expect(correctPaswordMatch).toBe(true);

      const incorrectPaswordMatch = await password.compare(
        "123456",
        userInDatabase.password,
      );

      expect(incorrectPaswordMatch).toBe(false);
    });

    test("With non existent 'username'", async () => {
      const createdUser = await orchestrator.createUser();
      await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/usuario2",
        {
          method: "PATCH",
          headers: { Cookie: `session_id=${sessionObject.token}` },
        },
      );

      const responseBody = await response.json();
      expect(response.status).toBe(404);

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Não foi possível encontrar este recurso no sistema.",
        action: "Verifique os parâmetros da consulta.",
        status_code: 404,
      });
    });

    test("With duplicated 'username'", async () => {
      await orchestrator.createUser({
        username: "duplicatedUser1",
      });

      const user2 = await orchestrator.createUser({
        username: "duplicatedUser2",
      });

      await orchestrator.activateUser(user2);
      const sessionObject2 = await orchestrator.createSession(user2.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/duplicatedUser2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            username: "duplicatedUser1",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro 'username' para realizar esta operação.",
        message: "O nome de usuário informado já está sendo utilizado.",
        status_code: 400,
      });
    });

    test("With 'username' case mismatch", async () => {
      const user = await orchestrator.createUser({
        username: "user1DefaultMismatch",
      });

      await orchestrator.activateUser(user);
      const sessionObject = await orchestrator.createSession(user.id);

      const response = await fetch(
        "http://localhost:3000/api/v1/users/user1DefaultMismatch",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject.token}`,
          },
          body: JSON.stringify({
            username: "User1DefaultMismatch",
          }),
        },
      );

      expect(response.status).toBe(200);
    });

    test("With duplicated 'email'", async () => {
      await orchestrator.createUser({
        email: "emailDefaultDuplicated1@email.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "emailDefaultDuplicated2@email.com",
      });

      await orchestrator.activateUser(createdUser2);
      const sessionObject2 = await orchestrator.createSession(createdUser2.id);

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Cookie: `session_id=${sessionObject2.token}`,
          },
          body: JSON.stringify({
            email: "emailDefaultDuplicated2@email.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro 'email' para realizar esta operação.",
        message: "O email informado já está sendo utilizado.",
        status_code: 400,
      });
    });
  });
});
