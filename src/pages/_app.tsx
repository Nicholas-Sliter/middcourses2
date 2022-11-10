import "../styles/globals.scss";
import type { AppProps /*, AppContext */ } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import TagManager from 'react-gtm-module'
import { useEffect } from "react";
import HeaderFooterLayout from "../layouts/HeaderFooterLayout";
delete theme.styles.global;


function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    TagManager.initialize({
      gtmId: 'GTM-WJDFWKT',
    })
  }, [])


  return (
    <>
      <meta name="viewport" content="width=device-width, user-scalable=no"></meta>
      <SessionProvider session={pageProps.session}>
        <ChakraProvider resetCSS={false}>
          <HeaderFooterLayout >
            <Component {...pageProps} />
          </HeaderFooterLayout>
        </ChakraProvider>
      </SessionProvider>
    </>
  );
}


export default MyApp;
