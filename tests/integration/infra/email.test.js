import email from "infra/email"

describe("infra/email", () => {
    test("send()", async () => {
        await email.send();
    })
})