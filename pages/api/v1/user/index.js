import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user.js";
import session from "models/session";

const router = createRouter();

router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  await session.renew(sessionObject.id);
  const foundedUser = await user.findOneById(sessionObject.user_id);
  response.status(201).json(foundedUser);
}
