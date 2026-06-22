import { ForbiddenError } from "infra/errors";

import { createRouter } from "next-connect";
import controller from "controller";
import authentication from "models/authentication";
import session from "models/session.js";
import authorization from "models/authorization";

const router = createRouter();

router
  .use(controller.injectAnonymousOrUser)
  .post(controller.canRequest("create:session"), postHandler)
  .delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;

  const authenticatedUser = await authentication.validate(
    userInputValues.email,
    userInputValues.password,
  );

  if (!authorization.can(authenticatedUser, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para fazer login",
      action: `Contate o suporte caso você acredite que isto seja um erro.`,
    });
  }

  const newSession = await session.create(authenticatedUser.id);

  const secureOutput = authorization.filterOutput(
    authenticatedUser,
    "read:session",
    newSession,
  );

  controller.setSessionCookie(secureOutput.token, response);

  return response.status(201).json(secureOutput);
}

async function deleteHandler(request, response) {
  const userTryingToDelete = request.context.user;
  const sessionToken = request.cookies.session_id;

  const sessionObject = await session.findOneValidByToken(sessionToken);

  const expiredSession = await session.expireById(sessionObject.id);

  const secureOutput = authorization.filterOutput(
    userTryingToDelete,
    "read:session",
    expiredSession,
  );

  controller.clearSessionCookie(response);

  return response.status(200).json(secureOutput);
}
