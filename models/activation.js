import email from "infra/email.js";

async function sendEmailToUser(user) {
  await email.send({
    from: "FinTab <contato@email.com.br>",
    to: user.email,
    subject: "Ative seu cadastro!",
    text: `${user.username}, clique no link abaixo para ativar sua conta.

https:///

Atenciosamente,
Equipe RE7
    `,
  });
}

const activation = {
  sendEmailToUser,
};

export default activation;
