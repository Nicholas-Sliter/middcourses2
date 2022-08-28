import useMobile from "../../hooks/useMobile"

function MobileView({ children }: { children: React.ReactNode }) {

  const isMobile = useMobile();
  return (
    <>
      {isMobile ? children : null}
    </>
  );
}

export default MobileView;