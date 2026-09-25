import { Banner } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ActivateUserPage() {
  const router = useRouter();
  const [activationStatus, setActivationStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  const activationTokenID = router.query.activationTokenId;

  useEffect(() => {
    if (!activationTokenID) {
      return;
    }

    sendActivationTokken();

    async function sendActivationTokken() {
      try {
        const response = await fetch(
          `/api/v1/activations/${activationTokenID}`,
          {
            method: "PATCH",
          },
        );

        const responseBody = await response.json();

        if (response.status === 200) {
          setActivationStatus("success");
          return;
        }
        setActivationStatus("failure", responseBody);
        setErrorMessage(`${responseBody.action}. ${responseBody.message}`);
      } catch (error) {
        setActivationStatus("failure", error);
        setErrorMessage(
          "Um erro indesperado no servidor ocorreu. Tente novamente mais tarde.",
        );
        return;
      }
    }
  }, [activationTokenID]);

  return (
    <DefaultLayout
      metadata={{ title: "Confirme seu email" }}
      contentWidth={"small"}
    >
      {activationStatus === "loading" && (
        <Banner variant="info">
          <Banner.Title>Verificando token...</Banner.Title>
        </Banner>
      )}
      {activationStatus === "success" && (
        <Banner variant="success">
          <Banner.Title>Cadastro ativado com sucesso!</Banner.Title>
          <Banner.Description>
            Sua conta está ativa e você já pode <a href="/login">fazer login</a>
          </Banner.Description>
        </Banner>
      )}
      {activationStatus === "failure" && (
        <Banner variant="critical">
          <Banner.Title>Não foi possível ativar o seu cadastro</Banner.Title>
          <Banner.Description>{errorMessage}</Banner.Description>
        </Banner>
      )}
    </DefaultLayout>
  );
}
