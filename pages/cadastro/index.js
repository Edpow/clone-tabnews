import { Button } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";
import { useState } from "react";

function RegisterPage() {
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
    <DefaultLayout>
      <h1>Cadastro</h1>
      <form onSubmit={handleSubmit}>
        <div>
          Usuário:
          <input
            type="text"
            value={username}
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          />
        </div>
        <div>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
        </div>
        <div>
          Senha:
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
        </div>
        <Button variant="primary">Criar cadastro</Button>
      </form>
    </DefaultLayout>
  );
}

export default RegisterPage;
