import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user.js";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const foundedUser = await user.findOneByUsername(username);
  response.status(200).json(foundedUser);
}
