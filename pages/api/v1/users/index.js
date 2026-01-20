import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user.js";
import activation from "models/activation";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = await request.body;
  const newUser = await user.create(userInputValues);
  await activation.sendEmailToUser(newUser);
  response.status(201).json(newUser);
}
