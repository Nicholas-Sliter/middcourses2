/**
 * React component that inserts a page title into the page head to allow page-by-page custom titles.
 * @file add page title to head.
 * @author Nicholas Sliter
 * 
 */


import Head from "next/head";

type PageTitleProps = {
  pageTitle?: string;
  description?: string;
};

export default function PageTitle({ pageTitle, description }: PageTitleProps) {
  const title: string = pageTitle
    ? `${pageTitle} | MiddCourses`
    : "MiddCourses";

  const metaDescription = description ? description : "MiddCourses is Middlebury's premier course discovery and anonymous course review platform. Browse our complete catalogue to discover Middlebury's top professors, courses, and departments.";

  return (
    <Head>
      <title key={title}>{title}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />

      {/*  Twitter  */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={metaDescription} />
    </Head>
  );
}

