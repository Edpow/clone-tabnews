import email from "infra/email.js"
import { tryLoadManifestWithRetries } from "next/dist/server/load-components";
import orchestrator from "tests/orchestrator";

describe("infra/email", () => {
    test("send()", async () => {

        await orchestrator.deleteAllEmails();

        await email.send({
            from: "FinTab <contato@fintab.com.br>",
            to: "contato@curso.dev",
            subject: "Teste de assunto",
            text: "Teste de Corpo."
        });

        await email.send({
            from: "FinTab <contato@fintab.com.br>",
            to: "contato@curso.dev",
            subject: "Último email",
            text: "Teste de Corpo."
        });

        const lastEmail = await orchestrator.getLastEmail();

        expect(lastEmail.sender).toBe("<contato@fintab.com.br>")
        expect(lastEmail.recipients[0]).toBe("<contato@curso.dev>")
        expect(lastEmail.subject).toBe("Último email")
        expect(lastEmail.text).toBe("Teste de Corpo.\n")

    })
})