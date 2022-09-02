//import dynamic from 'next/dynamic';
//const useMobile = dynamic<Function>(() => import('../../hooks/useMobile'), { ssr: false });
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