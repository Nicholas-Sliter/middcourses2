/**
 * React component that inserts a page title into the page head to allow page-by-page custom titles.
 * @file add page title to head.
 * @author Nicholas Sliter
 * 
 */


import Head from "next/head";

type PageTitleProps = {
  pageTitle?: string;
};

export default function PageTitle({ pageTitle }: PageTitleProps) {
  const title: string = pageTitle
    ? `${pageTitle} | MiddCourses`
    : "MiddCourses";

  return (
    <Head>
      <title key={title}>{title}</title>
    </Head>
  );
}

