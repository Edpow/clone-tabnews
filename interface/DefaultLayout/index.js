import { PageLayout } from "@primer/react";

export default function DefaultLayout({ children }) {
  return (
    <PageLayout>
      <PageLayout.Header>Cabeçalho</PageLayout.Header>
      <PageLayout.Content>{children}</PageLayout.Content>
      <PageLayout.Footer>Conteúdo</PageLayout.Footer>
    </PageLayout>
  );
}
