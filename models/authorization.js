import { InternalServerError } from "infra/errors";

const avaiableFeatures = [
  "create:user",
  "read:user",
  "read:user:self",
  "update:user",
  "update:user:self",
  "update:user:others",
  "create:session",
  "read:session",
  "read:activation_token",
  "create:migration",
  "read:migration",
  "run:migration",
  "read:status",
  "read:status:all",
];

function can(user, feature, resource) {
  validateUser(user);
  validateFeatures(feature);

  let authorized = false;

  if (user.features.includes(feature)) {
    authorized = true;
  }

  if (feature === "update:user" && resource) {
    authorized = false;

    if (user.id === resource.id || can(user, "update:user:others")) {
      authorized = true;
    }
  }

  return authorized;
}

function filterOutput(user, feature, resource) {
  validateUser(user);
  validateFeatures(feature);
  validateResource(resource);

  if (feature === "read:user") {
    return {
      id: resource.id,
      username: resource.username,
      features: resource.features,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === resource.id) {
      return {
        id: resource.id,
        username: resource.username,
        email: resource.email,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === resource.user_id) {
      return {
        id: resource.id,
        token: resource.token,
        user_id: resource.user_id,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
        expires_at: resource.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: resource.id,
      used_at: resource.used_at,
      user_id: resource.user_id,
      created_at: resource.created_at,
      updated_at: resource.updated_at,
      expires_at: resource.expires_at,
    };
  }

  if (feature === "read:migration") {
    return resource.map((migration) => {
      return {
        path: migration.path,
        name: migration.name,
        timestamp: migration.timestamp,
      };
    });
  }

  if (feature === "read:status") {
    const output = {
      updated_at: resource.updated_at,
      dependencies: {
        database: {
          max_connections: resource.dependencies.database.max_connections,
          opened_connections: resource.dependencies.database.opened_connections,
        },
      },
    };

    if (can(user, "read:status:all")) {
      output.dependencies.database.server_version =
        resource.dependencies.database.server_version;
    }

    return output;
  }
}

function validateUser(user) {
  if (!user || !user.features) {
    throw new InternalServerError({
      cause: "É necessário fornecer `user` no model `authorization",
    });
  }
}

function validateFeatures(feature) {
  if (!feature || !avaiableFeatures.includes(feature)) {
    throw new InternalServerError({
      cause: "É necessário fornecer `features` no model `authorization",
    });
  }
}

function validateResource(resource) {
  if (typeof resource !== "object") {
    throw new InternalServerError({
      cause:
        "É necessário fornecer um objeto em `resource` no model `authorization",
    });
  }

  if (!resource) {
    throw new InternalServerError({
      cause: "É necessário fornecer `resource` no model `authorization",
    });
  }
}
const authorization = {
  can,
  filterOutput,
};

export default authorization;
