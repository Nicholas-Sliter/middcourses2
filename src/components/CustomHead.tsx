import Head from "next/head";

type CustomHeadProps = {
  pageTitle?: string;
};

export default function CustomHead({ pageTitle }: CustomHeadProps) {
  const title: string = pageTitle ? `${pageTitle} | MiddCourses` : "MiddCourses";

  return (
    <Head>
      <title>{title}</title>
    </Head>
  );
}
