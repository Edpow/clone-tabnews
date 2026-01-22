import { createRouter } from "next-connect";
import controller from "controller";
import activation from "models/activation";

const router = createRouter();

router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationToken = request.query.token_id;

  const validActivationToken =
    await activation.findOneValidById(activationToken);
  const usedActivationToken = await activation.markTokenAsUsed(
    validActivationToken.id,
  );

  await activation.activateUserByUserId(validActivationToken.user_id);

  response.status(200).json(usedActivationToken);
}
