import useMobile from "../../hooks/useMobile"

function MobileView({ children, renderDefault = false }: { children: React.ReactNode, renderDefault?: boolean }) {

  const isMobile = useMobile(renderDefault);

  return (
    <>
      {isMobile ? children : null}
    </>
  );
}

export default MobileView;