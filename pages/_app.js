import "@primer/primitives/dist/css/functional/themes/light.css";
import { BaseStyles } from "@primer/react";
import { ThemeProvider } from "@primer/react/next";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <BaseStyles>
        <Component {...pageProps} />
      </BaseStyles>
    </ThemeProvider>
  );
}
