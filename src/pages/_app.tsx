import "../styles/globals.scss";
import type { AppProps /*, AppContext */ } from "next/app";
import { SessionProvider } from "next-auth/react";
import { ChakraProvider, theme } from "@chakra-ui/react";
import TagManager from 'react-gtm-module'
import { useEffect } from "react";
import HeaderFooterLayout from "../layouts/HeaderFooterLayout";
import { clarity } from 'react-microsoft-clarity';
import Script from "next/script";
import BannedUserNotice from "../components/BannedUserNotice";
import { setAnalyticsFlag } from "../lib/frontend/utils";
import { CustomSession } from "../lib/common/types";

delete theme.styles.global;


/* Banned user redirect */
const ViewableComponent = ({ isBanned, children }: { isBanned?: boolean, children: React.ReactNode }) => {
  if (isBanned) {
    //TODO: make this pretty
    return <BannedUserNotice />
  }

  return (
    <>{children}</>
  )

}


function MyApp({ Component, pageProps }: AppProps) {

  useEffect(() => {
    TagManager.initialize({
      gtmId: 'GTM-WJDFWKT',
    });

    clarity.init('iif5lextku');
  }, []);

  const user = (pageProps.session?.user ?? null) as CustomSession['user'] | null;
  useEffect(() => {
    const userID = user?.id;
    if (userID && clarity.hasStarted()) {
      clarity.identify(userID, {
        ...pageProps.session?.user,
      });

      setAnalyticsFlag('user_id', userID);
      setAnalyticsFlag('user_email', user.email ?? null);
      setAnalyticsFlag('user_role', user.role ?? null);
      setAnalyticsFlag('user_banned', `${user.banned}` ?? null);
    }


  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <>
      <meta name="viewport" content="width=device-width, user-scalable=no"></meta>
      <SessionProvider session={pageProps.session}>
        <ChakraProvider resetCSS={false}>
          <HeaderFooterLayout >
            <ViewableComponent isBanned={pageProps?.session?.user?.banned === true} >
              <Component {...pageProps} />
            </ViewableComponent>
          </HeaderFooterLayout>
        </ChakraProvider>
      </SessionProvider>
    </>
  );
}


export default MyApp;
