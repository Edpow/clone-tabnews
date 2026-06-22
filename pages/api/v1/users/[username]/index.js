import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user.js";
import { ForbiddenError } from "infra/errors";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const username = request.query.username;
  const foundedUser = await user.findOneByUsername(username);

  const secureOutput = authorization.filterOutput(
    userTryingToGet,
    "read:user",
    foundedUser,
  );

  response.status(200).json(secureOutput);
}
async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const userTryingToRequest = request.context.user;
  const targetUser = await user.findOneByUsername(username);

  if (!authorization.can(userTryingToRequest, "update:user", targetUser)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para atualizar outro usuário.",
      action:
        "Verifique se você possui a feature necessário para realizar esta ação",
    });
  }

  const updatedUser = await user.update(username, userInputValues);

  const secureOutput = authorization.filterOutput(
    userTryingToRequest,
    "read:user",
    updatedUser,
  );

  response.status(200).json(secureOutput);
}
