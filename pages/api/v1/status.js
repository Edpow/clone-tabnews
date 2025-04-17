import database from "infra/database.js";
import { InternalServerError } from "infra/errors";

async function status(request, response) {
  try {
    const updatedAt = new Date().toISOString();
    const serverVersionResult = await database.query("SHOW server_version;");
    const maxConnectionsResult = await database.query("SHOW max_connections;");
    const databaseName = process.env.POSTGRES_DB;
    const openedConnectionsResult = await database.query({
      text: "SELECT count(*)::int as count from pg_stat_activity WHERE datname=$1;",
      values: [databaseName],
    });
    response.status(200).json({
      updated_at: updatedAt,
      dependencies: {
        server_version: serverVersionResult.rows[0].server_version,
        max_connections: parseInt(maxConnectionsResult.rows[0].max_connections),
        opened_connections: openedConnectionsResult.rows[0].count,
      },
    });
  } catch (error) {
    const publicErrorObject = new InternalServerError({ cause: error });
    response.status(500).json(publicErrorObject);
  }
}

export default status;
