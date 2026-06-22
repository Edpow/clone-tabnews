import { createRouter } from "next-connect";
import controller from "controller";
import activation from "models/activation";
import authorization from "models/authorization";

const router = createRouter();

router
  .use(controller.injectAnonymousOrUser)
  .patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const userTryingToUpdate = request.context.user;
  const activationToken = request.query.token_id;

  const validActivationToken =
    await activation.findOneValidById(activationToken);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  const secureOutput = authorization.filterOutput(
    userTryingToUpdate,
    "read:activation_token",
    usedActivationToken,
  );

  response.status(200).json(secureOutput);
}
