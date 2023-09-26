import "../styles/globals.scss";
import type { AppProps /*, AppContext */ } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import TagManager from 'react-gtm-module'
import { useEffect } from "react";
import HeaderFooterLayout from "../layouts/HeaderFooterLayout";
import { clarity } from 'react-microsoft-clarity';
import Script from "next/script";

delete theme.styles.global;


function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    TagManager.initialize({
      gtmId: 'GTM-WJDFWKT',
    })

    clarity.init('iif5lextku');

  }, []);

  useEffect(() => {
    const userID = pageProps.session?.user?.id ?? null;
    if (userID) {
      // console.log('Identifying user with Clarity', userID);
      clarity.identify(userID, {
        ...pageProps.session?.user,
      });

      clarity.setTag('user_id', userID);
      clarity.setTag('user_email', pageProps.session?.user?.email ?? null);
      clarity.setTag('user_role', pageProps.session?.user?.role ?? null);
    }


  }, [pageProps.session?.user?.id]); // eslint-disable-line react-hooks/exhaustive-deps


  /* Banned user redirect */
  const ViewableComponent = () => {
    if (pageProps.session?.user?.banned) {
      // TODO: make this pretty
      return (
        <div>
          <h1>You have been banned</h1>
        </div>
      )
    }

    return (
      <Component {...pageProps} />
    )

  }


  return (
    <>
      <meta name="viewport" content="width=device-width, user-scalable=no"></meta>
      <SessionProvider session={pageProps.session}>
        <ChakraProvider resetCSS={false}>
          <HeaderFooterLayout >
            <ViewableComponent />
          </HeaderFooterLayout>
        </ChakraProvider>
      </SessionProvider>
      <Script
        strategy="afterInteractive"
        id="MiddCourses_Clarity"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window, document, "clarity", "script", "iif5lextku");`
        }}
      />
    </>
  );
}


export default MyApp;
