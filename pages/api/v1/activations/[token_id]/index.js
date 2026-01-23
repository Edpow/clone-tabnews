import { createRouter } from "next-connect";
import controller from "controller";
import activation from "models/activation";

const router = createRouter();

router
  .use(controller.injectAnonymousOrUser)
  .patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationToken = request.query.token_id;

  const validActivationToken =
    await activation.findOneValidById(activationToken);

  await activation.activateUserByUserId(validActivationToken.user_id);

  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  response.status(200).json(usedActivationToken);
}
