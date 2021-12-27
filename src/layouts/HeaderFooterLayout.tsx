import CustomHead from "../components/CustomHead";
import Header from "../components/Header";
import Footer from "../components/Footer";

type HeaderFooterLayoutProps = {
  pageTitle?: string;
  children?: React.ReactNode;
};

export default function HeaderFooterLayout({ pageTitle, children }) {
  return (
    <>
      <CustomHead pageTitle={pageTitle} />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
