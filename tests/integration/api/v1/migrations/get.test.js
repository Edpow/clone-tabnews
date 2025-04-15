import database from "infra/database.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitFormAllServices();
});

beforeAll(clearDatabase);

async function clearDatabase() {
  await database.query(
    "drop schema if exists public cascade; create schema public;",
  );
}

test("GET to /api/v1/migrations should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/migrations");

  expect(response.status).toBe(200);

  const responseBody = await response.json();

  console.log(responseBody);

  expect(Array.isArray(responseBody)).toBe(true);

  expect(responseBody.length).toBeGreaterThan(0);
});
