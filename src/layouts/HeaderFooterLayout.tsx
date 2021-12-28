import CustomHead from "../components/CustomHead";
import Header from "../components/Header";
import Footer from "../components/Footer";

type HeaderFooterLayoutProps = {
  children?: React.ReactNode;
};

export default function HeaderFooterLayout({children}) {
  return (
    <>
      <CustomHead />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
