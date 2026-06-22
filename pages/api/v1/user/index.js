import controller from "controller";
import authorization from "models/authorization";
import session from "models/session";
import user from "models/user.js";
import { createRouter } from "next-connect";

const router = createRouter();

router
  .use(controller.injectAnonymousOrUser)
  .get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSessionObject = await session.renew(sessionObject.id);
  controller.setSessionCookie(renewedSessionObject.token, response);
  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );
  const foundedUser = await user.findOneById(sessionObject.user_id);

  const secureOutput = authorization.filterOutput(
    userTryingToGet,
    "read:user:self",
    foundedUser,
  );

  return response.status(200).json(secureOutput);
}
