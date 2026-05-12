function can(user, feature, resource) {
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

function filterOutput(user, feature, output) {
  if (feature === "read:user") {
    return {
      id: output.id,
      username: output.username,
      features: output.features,
      created_at: output.created_at,
      updated_at: output.updated_at,
    };
  }

  if (feature === "read:user:self") {
    if (user.id === output.id) {
      return {
        id: output.id,
        username: output.username,
        email: output.email,
        features: output.features,
        created_at: output.created_at,
        updated_at: output.updated_at,
      };
    }
  }

  if (feature === "read:session") {
    if (user.id === output.user_id) {
      return {
        id: output.id,
        token: output.token,
        user_id: output.user_id,
        features: output.features,
        created_at: output.created_at,
        updated_at: output.updated_at,
        expires_at: output.expires_at,
      };
    }
  }

  if (feature === "read:activation_token") {
    return {
      id: output.id,
      used_at: output.token,
      user_id: output.user_id,
      created_at: output.created_at,
      updated_at: output.updated_at,
      expires_at: output.expires_at,
    };
  }
}

const authorization = {
  can,
  filterOutput,
};

export default authorization;
