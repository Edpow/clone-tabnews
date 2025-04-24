import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const foundedUser = await user.findOneByUsername(username);
  response.status(200).json(foundedUser);
}
async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;
  const updatedUser = await user.update(username, userInputValues);
  response.status(200).json(updatedUser);
}
