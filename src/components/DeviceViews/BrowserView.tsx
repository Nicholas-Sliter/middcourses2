import useMobile from "../../hooks/useMobile"

function BrowserView({ children }: { children: React.ReactNode }) {

  const isMobile = useMobile();
  return (
    <>
      {!isMobile ? children : null
      }
    </>
  );
}

export default BrowserView;