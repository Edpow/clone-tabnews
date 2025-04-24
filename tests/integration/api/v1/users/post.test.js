import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import password from "models/password";
import user from "models/user";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "edpow",
          email: "edpow@email.com",
          password: "123456",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "edpow",
        email: "edpow@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("edpow");
      const correctPaswordMatch = await password.compare(
        "123456",
        userInDatabase.password,
      );

      expect(correctPaswordMatch).toBe(true);

      const incorrectPaswordMatch = await password.compare(
        "123456789",
        userInDatabase.password,
      );

      expect(incorrectPaswordMatch).toBe(false);
    });

    test("With duplicated email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "edpow1",
          email: "edpow1@email.com",
          password: "123456",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "edpow2",
          email: "Edpow1@email.com",
          password: "123456",
        }),
      });

      expect(response2.status).toBe(400);

      const responseBody = await response2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro 'email' para realizar esta operação.",
        message: "O email informado já está sendo utilizado.",
        status_code: 400,
      });
    });

    test("With duplicated username", async () => {
      const responseUsername = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "edpowUsername",
            email: "edpowUsername@email.com",
            password: "123456",
          }),
        },
      );

      expect(responseUsername.status).toBe(201);

      const responseUsername2 = await fetch(
        "http://localhost:3000/api/v1/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "EdpowUsername",
            email: "EdpowUsername2@email.com",
            password: "123456",
          }),
        },
      );

      expect(responseUsername2.status).toBe(400);

      const responseBody = await responseUsername2.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        action: "Utilize outro 'username' para realizar esta operação.",
        message: "O nome de usuário informado já está sendo utilizado.",
        status_code: 400,
      });
    });
  });
});
