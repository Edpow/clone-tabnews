import database from "infra/database.js";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;
  async function hashPasswordInObject(userInputValues) {
    const hashedPassword = await password.hash(userInputValues.password);
    userInputValues.password = hashedPassword;
  }

  async function runInsertQuery(userInputValues) {
    const results = await database.query({
      text: `
      INSERT INTO 
        users (username, email, password)
      VALUES
        ($1, $2, $3)
      RETURNING
        *
      ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return results.rows[0];
  }
}

async function validateUniqueUsername(username) {
  const results = await database.query({
    text: `
    SELECT
      COUNT(username)::int
    FROM
      users
    WHERE
      LOWER(username)=LOWER($1)
    ;`,
    values: [username],
  });

  if (results.rows[0].count > 0) {
    throw new ValidationError({
      message: "O nome de usuário informado já está sendo utilizado.",
      action: "Utilize outro 'username' para realizar esta operação.",
    });
  }
}

async function validateUniqueEmail(email) {
  const results = await database.query({
    text: `
    SELECT
      COUNT(email)::int
    FROM
      users
    WHERE
      LOWER(email)=LOWER($1)
    ;`,
    values: [email],
  });

  if (results.rows[0].count > 0) {
    throw new ValidationError({
      message: "O email informado já está sendo utilizado.",
      action: "Utilize outro 'email' para realizar esta operação.",
    });
  }
}

async function findOneByUsername(username) {
  const foundedUser = await runSelectQuery(username);
  return foundedUser;

  async function runSelectQuery(username) {
    const results = await database.query({
      text: `
      SELECT 
        *
      FROM 
        users
      WHERE
        LOWER(username) = LOWER($1)
      LIMIT
        1
      ;`,
      values: [username],
    });

    if (results.rowCount === 0) {
      throw new NotFoundError({});
    }

    return results.rows[0];
  }
}

async function update(username, userInputValues) {
  console.log(username, userInputValues);
  const currentUser = await findOneByUsername(username);

  console.log(currentUser);

  if ("username" in userInputValues) {
    if (username.toLowerCase() !== userInputValues.username.toLowerCase()) {
      await validateUniqueUsername(userInputValues.username);
    }
  }

  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }
}

const user = {
  create,
  findOneByUsername,
  update,
};

export default user;
