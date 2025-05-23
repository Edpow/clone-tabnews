import { createRouter } from "next-connect";
import controller from "controller";
import user from "models/user";
import password from "models/password";
import { UnauthorizedError } from "infra/errors.js";

const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInputValues = request.body;
  let userStored;
  try {
    userStored = await user.findOneByEmail(userInputValues.email);
    const correctPasswordMatch = await password.compare(
      userInputValues.password,
      userStored.password,
    );

    if (!correctPasswordMatch) {
      throw new UnauthorizedError({
        message: "Senha não confere.",
        action: "Verifique se este dado esta correto.",
      });
    }
  } catch (error) {
    throw new UnauthorizedError({
      message: "Dados não conferem.",
    });
  }

  return response.status(201).json({});
}
