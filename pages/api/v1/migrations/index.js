import { createRouter } from "next-connect";
import migrator from "models/migrator";
import controller from "controller";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:migration"), getHandler);
router.post(controller.canRequest("run:migration"), postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  const userTryingToGet = request.context.user;

  const secureOutput = authorization.filterOutput(
    userTryingToGet,
    "read:migration",
    pendingMigrations,
  );

  return response.status(200).json(secureOutput);
}

async function postHandler(request, response) {
  const migrateMigration = await migrator.applyPendingMigrations();
  if (migrateMigration.length > 0) {
    return response.status(201).json(migrateMigration);
  }
  return response.status(200).json(migrateMigration);
}
