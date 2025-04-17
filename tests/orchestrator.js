import retry from "async-retry";
import database from "infra/database";

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

const orchestrator = {
  waitFormAllServices,
  clearDatabase,
};

export default orchestrator;
