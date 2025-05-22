import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import { faker } from "@faker-js/faker";

async function waitFormAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      await fetch("http://localhost:3000/api/v1/status");
    }
  }
}

async function clearDatabase() {
  await database.query(
    "drop schema if exists public cascade; create schema public;",
  );
}

async function applyPendingMigrations() {
  await migrator.applyPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username ||
      faker.internet
        .username()
        .replace("_", "")
        .replace(".", "")
        .replace("-", ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || "validpassword",
  });
}

const orchestrator = {
  waitFormAllServices,
  clearDatabase,
  applyPendingMigrations,
  createUser,
};

export default orchestrator;
