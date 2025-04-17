import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database";

export default async function status(request, response) {
  let dbClient;

  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).end();
  }

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      databaseUrl: process.env.DATABASE_URL,
      dryRun: true,
      dir: resolve("infra", "migrations"),
      direction: "up",
      verbose: true,
      migrationsTable: "pgmigrations",
    };

    if (request.method == "GET") {
      const pendingMigrations = await migrationRunner({
        ...defaultMigrationOptions,
      });
      return response.status(200).json(pendingMigrations);
    }

    if (request.method == "POST") {
      const migrateMigration = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });
      await dbClient.end();
      if (migrateMigration.length > 0) {
        return response.status(201).json(migrateMigration);
      }

      return response.status(200).json(migrateMigration);
    }
    return response.status(405).end();
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
