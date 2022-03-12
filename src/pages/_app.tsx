import "../styles/globals.scss";
import type { AppProps /*, AppContext */ } from "next/app";
import { SessionProvider } from "next-auth/react";
import { getProviders } from "next-auth/react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import {TagManager} from 'react-gtm-module'
import { useEffect } from "react";

delete theme.styles.global;

import HeaderFooterLayout from "../layouts/HeaderFooterLayout";

function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    TagManager.initialize({
      gtmId: 'GTM-WJDFWKT',
    })
  }, [])

  return (
    <SessionProvider session={pageProps.session}>
      <ChakraProvider resetCSS={false}>
        <HeaderFooterLayout >
          <Component {...pageProps} />
        </HeaderFooterLayout>
      </ChakraProvider>
    </SessionProvider>
  );
}


export default MyApp;


export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
