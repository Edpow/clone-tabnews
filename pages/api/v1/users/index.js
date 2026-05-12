import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user.js";
import activation from "models/activation";
import authorization from "models/authorization";

const router = createRouter();

router
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userTryingToPost = request.context.user;
  const userInputValues = await request.body;
  const newUser = await user.create(userInputValues);
  const token = await activation.create(newUser.id);
  await activation.sendEmailToUser(newUser, token);

  const secureOutput = authorization.filterOutput(
    userTryingToPost,
    "read:user",
    newUser,
  );

  response.status(201).json(secureOutput);
}
