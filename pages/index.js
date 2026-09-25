import DefaultLayout from "interface/DefaultLayout";

export default function Home() {
  return (
    <DefaultLayout
      metadata={{
        title: "Home",
        description: "Página inicial.",
      }}
    >
      <h1>Home</h1>
    </DefaultLayout>
  );
}
