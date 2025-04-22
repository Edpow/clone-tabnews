import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";
import { ServiceError } from "infra/errors";

const defaultMigrationOptions = {
  databaseUrl: process.env.DATABASE_URL,
  dryRun: true,
  dir: resolve("infra", "migrations"),
  direction: "up",
  verbose: true,
  migrationsTable: "pgmigrations",
};

async function listPendingMigrations() {
  let dbClient;
  try {
    dbClient = await database.getNewClient();
    const pendingMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
    });
    return pendingMigrations;
  } catch (error) {
    const publicErrorObject = new ServiceError({
      cause: error,
    });
    throw publicErrorObject;
  } finally {
    await dbClient?.end();
  }
}

async function applyPendingMigrations() {
  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const migrateMigration = await migrationRunner({
      ...defaultMigrationOptions,
      dbClient: dbClient,
      dryRun: false,
    });
    await dbClient.end();
    return migrateMigration;
  } catch (error) {
    const publicErrorObject = new ServiceError({
      cause: error,
    });
    throw publicErrorObject;
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  applyPendingMigrations,
};

export default migrator;
