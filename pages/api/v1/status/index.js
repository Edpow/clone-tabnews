import controller from "controller";
import database from "infra/database.js";
import authorization from "models/authorization";
import { createRouter } from "next-connect";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:status"), status);

export default router.handler(controller.errorHandlers);

async function status(request, response) {
  const userTryingToGet = request.context.user;

  const updatedAt = new Date().toISOString();
  const serverVersionResult = await database.query("SHOW server_version;");
  const maxConnectionsResult = await database.query("SHOW max_connections;");
  const databaseName = process.env.POSTGRES_DB;
  const openedConnectionsResult = await database.query({
    text: "SELECT count(*)::int as count from pg_stat_activity WHERE datname=$1;",
    values: [databaseName],
  });

  const result = {
    updated_at: updatedAt,
    dependencies: {
      database: {
        server_version: serverVersionResult.rows[0].server_version,
        max_connections: parseInt(maxConnectionsResult.rows[0].max_connections),
        opened_connections: openedConnectionsResult.rows[0].count,
      },
    },
  };

  const secureOutput = authorization.filterOutput(
    userTryingToGet,
    "read:status",
    result,
  );

  return response.status(200).json(secureOutput);
}
