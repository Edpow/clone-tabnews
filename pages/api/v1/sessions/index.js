import { createRouter } from "next-connect";
import controller from "controller";
import authentication from "models/authentication";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  const authenticatedUser = await authentication.validate(
    userInputValues.email,
    userInputValues.password,
  );
  return response.status(201).json(authenticatedUser);
}
