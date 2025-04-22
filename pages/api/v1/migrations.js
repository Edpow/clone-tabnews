import { createRouter } from "next-connect";
import migrator from "models/migrator";
import controller from "controller";

const router = createRouter();

router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  const migrateMigration = await migrator.applyPendingMigrations();
  if (migrateMigration.length > 0) {
    return response.status(201).json(migrateMigration);
  }
  return response.status(200).json(migrateMigration);
}
