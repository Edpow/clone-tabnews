import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.applyPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With noexistent session", async () => {
      const nonexistentToken =
        "2a9affa68fb2302f1e0a527536f0eed7d3a93a07ebc063409171c7518f57ed2c9eeadf805f1e249693ec7db4a191e96f";

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: { cookie: `session_id=${nonexistentToken}` },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "O Usuário não possui uma sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "edpow",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: { cookie: `session_id=${sessionObject.token}` },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      expect(
        responseBody.expires_at < sessionObject.expires_at.toISOString(),
      ).toBe(true);

      // Set-Cookie assertions

      const parsedSetCookie = setCookieParser(response, { map: true });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        path: "/",
        httpOnly: true,
        maxAge: -1,
      });

      const doubleCheckResponse = await fetch(
        "http://localhost:3000/api/v1/user",
        {
          headers: { cookie: `session_id=${sessionObject.token}` },
        },
      );

      expect(doubleCheckResponse.status).toBe(401);

      const doubleCheckResponseBody = await doubleCheckResponse.json();

      expect(doubleCheckResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "O Usuário não possui uma sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });

    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });

      const createdUser = await orchestrator.createUser({
        username: "userWithExpiredSession",
      });

      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: { cookie: `session_id=${sessionObject.token}` },
      });

      expect(response.status).toBe(401);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "O Usuário não possui uma sessão ativa.",
        action: "Verifique se o usuário está logado e tente novamente.",
        status_code: 401,
      });
    });
  });
});
