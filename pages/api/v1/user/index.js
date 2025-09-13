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
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSessionObject.token, response);
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  const foundedUser = await user.findOneById(sessionObject.user_id);
  response.status(200).json(foundedUser);
}
