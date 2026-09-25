import { Banner } from "@primer/react";
import DefaultLayout from "interface/DefaultLayout";

export default function ConfimRegisterPage() {
  return (
    <DefaultLayout
      metadata={{ title: "Confirme seu email" }}
      contentWidth={"small"}
    >
      <Banner
        variant="warning"
        title="Confira seu email"
        description="Abra o emeil enviado pelo TabNews e clique no link de confirmação"
      />
    </DefaultLayout>
  );
}
