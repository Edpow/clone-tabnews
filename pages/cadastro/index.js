import { Button, FormControl, Heading, Stack, TextInput } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";
import { useState } from "react";

function RegisterPage() {
  return (
    <DefaultLayout
      contentWidth="small"
      metadata={{
        title: "Cadastro",
        description: "Crie sua conta de forma gratuita.",
      }}
    >
      <Stack gap={"spacious"}>
        <Heading as="h1">Cadastro</Heading>
        <RegisterForm />
      </Stack>
    </DefaultLayout>
  );
}

function RegisterForm() {
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requestBody = { username, email, password };

    const response = await fetch("/api/v1/users", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 201) {
      location.href = "/cadastro/confirmar";
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={"cozy"}>
        <FormControl>
          <FormControl.Label>Usuário</FormControl.Label>
          <TextInput
            block
            type="text"
            value={username}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Email</FormControl.Label>
          <TextInput
            block
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </FormControl>
        <FormControl>
          <FormControl.Label>Senha</FormControl.Label>
          <TextInput
            block
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </FormControl>

        <Stack.Item>
          <Button type="submit" variant="primary">
            Criar cadastro
          </Button>
        </Stack.Item>
      </Stack>
    </form>
  );
}

export default RegisterPage;
