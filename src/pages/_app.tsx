import "../styles/globals.scss";
import type { AppProps /*, AppContext */ } from "next/app";

import HeaderFooterLayout from "../layouts/HeaderFooterLayout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <HeaderFooterLayout>
      <Component {...pageProps} />
    </HeaderFooterLayout>
  );
}

export default MyApp;
