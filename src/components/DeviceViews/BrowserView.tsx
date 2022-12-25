//import dynamic from 'next/dynamic';
//const useMobile = dynamic<Function>(() => import('../../hooks/useMobile'), { ssr: false });
import useMobile from "../../hooks/useMobile"


function BrowserView({ children, renderDefault = false }: { children: React.ReactNode, renderDefault?: boolean }) {

  const isMobile = useMobile(!renderDefault);

  if (isMobile === undefined) return null;

  return (
    <>
      {!isMobile ? children : null
      }
    </>
  );
}

export default BrowserView;