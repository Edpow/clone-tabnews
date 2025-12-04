import retry from "async-retry";
import database from "infra/database";
import migrator from "models/migrator";
import user from "models/user";
import { faker } from "@faker-js/faker";
import session from "models/session";

const emailAPIURL = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitFormAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      await fetch("http://localhost:3000/api/v1/status");
    }
  }

  async function waitForEmailServer() {
    return retry(fetchEmailPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchEmailPage() {
      await fetch(emailAPIURL);
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
      userObject?.username ||
      faker.internet
        .username()
        .replace("_", "")
        .replace(".", "")
        .replace("-", ""),
    email: userObject?.email || faker.internet.email(),
    password: userObject?.password || "validpassword",
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${emailAPIURL}/messages`, { method: "DELETE" });
}

async function getLastEmail() {
  const emailListResponse = await fetch(`${emailAPIURL}/messages`);
  const emailListResponseBody = await emailListResponse.json();
  const lastEmailItem = emailListResponseBody.pop();
  const lastEmailTextResponse = await fetch(
    `${emailAPIURL}/messages/${lastEmailItem.id}.plain`,
  );
  const lastEmailTextResponseBody = await lastEmailTextResponse.text();
  return { ...lastEmailItem, text: lastEmailTextResponseBody };
}

const orchestrator = {
  waitFormAllServices,
  clearDatabase,
  applyPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
};

export default orchestrator;
