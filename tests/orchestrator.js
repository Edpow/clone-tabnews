import { faker } from "@faker-js/faker";
import retry from "async-retry";
import database from "infra/database";
import webserver from "infra/webserver";
import activation from "models/activation";
import migrator from "models/migrator";
import session from "models/session";
import user from "models/user";

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
      await fetch(`${webserver.origin}/api/v1/status`);
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

  if (!lastEmailItem) {
    return;
  }

  const lastEmailTextResponse = await fetch(
    `${emailAPIURL}/messages/${lastEmailItem.id}.plain`,
  );
  const lastEmailTextResponseBody = await lastEmailTextResponse.text();
  return { ...lastEmailItem, text: lastEmailTextResponseBody };
}

function extractUUID(text) {
  const uuidRegex =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
  const uuid = text.match(uuidRegex)[0];
  return uuid ? uuid : null;
}

async function activateUser(user) {
  return await activation.activateUserByUserId(user.id);
}

async function addFeaturesToUser(userObject, features) {
  return await user.addFeatures(userObject.id, features);
}

const orchestrator = {
  waitFormAllServices,
  clearDatabase,
  applyPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
  activateUser,
  addFeaturesToUser,
};

export default orchestrator;
