import "../styles/globals.scss";
import type { AppProps /*, AppContext */ } from "next/app";
import { SessionProvider } from "next-auth/react";

import HeaderFooterLayout from "../layouts/HeaderFooterLayout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <HeaderFooterLayout>
        <Component {...pageProps} />
      </HeaderFooterLayout>
    </SessionProvider>
  );
}

export default MyApp;
