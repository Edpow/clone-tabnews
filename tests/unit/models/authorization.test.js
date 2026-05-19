import { InternalServerError } from "infra/errors";
import authorization from "models/authorization";

describe("models/authorization.js", () => {
  describe(".can()", () => {
    test("without user", () => {
      expect(() => authorization.can()).toThrow(InternalServerError);
    });
    test("without user.features", () => {
      const createdUser = {
        username: "userWithoutFeatures",
      };
      expect(() => authorization.can(createdUser)).toThrow(InternalServerError);
    });
    test("without unknown feature", () => {
      const createdUser = {
        features: [],
      };
      expect(() => authorization.can(createdUser, "unknown:feature")).toThrow(
        InternalServerError,
      );
    });
    test("with valid user and known feature", () => {
      const createdUser = {
        features: ["create:user"],
      };
      expect(authorization.can(createdUser, "create:user")).toBe(true);
    });
  });
  describe(".filterOutput()", () => {
    test("without user", () => {
      expect(() => authorization.filterOutput()).toThrow(InternalServerError);
    });
    test("without user.features", () => {
      const createdUser = {
        username: "userWithoutFeatures",
      };
      expect(() => authorization.filterOutput(createdUser)).toThrow(
        InternalServerError,
      );
    });
    test("without unknown feature", () => {
      const createdUser = {
        features: [],
      };
      expect(() =>
        authorization.filterOutput(createdUser, "unknown:feature"),
      ).toThrow(InternalServerError);
    });

    test("with valid user, known feature and unknown resource", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() =>
        authorization.filterOutput(createdUser, "read:user"),
      ).toThrow(InternalServerError);
    });

    test("with valid user, known feature and undefined resource", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() =>
        authorization.filterOutput(createdUser, "read:user", undefined),
      ).toThrow(InternalServerError);
    });
    test("with valid user, known feature and null resource", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() =>
        authorization.filterOutput(createdUser, "read:user", null),
      ).toThrow(InternalServerError);
    });

    test("with valid user, known feature and resource as 0", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() =>
        authorization.filterOutput(createdUser, "read:user", 0),
      ).toThrow(InternalServerError);
    });

    test("with valid user, known feature and resource as 1", () => {
      const createdUser = {
        features: ["read:user"],
      };

      expect(() =>
        authorization.filterOutput(createdUser, "read:user", 1),
      ).toThrow(InternalServerError);
    });

    test("with valid user, known feature and resource", () => {
      const createdUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        email: "resource@resource.com",
        password: "resource",
      };
      expect(
        authorization.filterOutput(createdUser, "read:user", resource),
      ).toEqual({
        id: 1,
        username: "resource",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      });
    });
  });
});
