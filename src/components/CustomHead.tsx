/**
 * React component that inserts custom configuration info to the page head.
 * @file add configuration info to head.
 * @author Nicholas Sliter
 *
 */

import Head from "next/head";

export default function CustomHead() {
  const title: string = "MiddCourses";
  const keywords = "Middlebury, MiddCourses, Course Reviews, Middlebury College, Course, Course Evaluations, Midd Courses, rate professors, course ratings, find courses, data, course recommendations, top courses, RateMyProfessor, MiddKid ";

  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicons/favicon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=2" />
      <link rel="alt icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png?v=2" />
      <link rel="alt icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png?v=2" />
      <link rel="manifest" href="/favicons/site.webmanifest?v=2" />
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg?v=2" color="#1e66aa" />
      <link rel="shortcut icon" sizes="any" href="/favicons/favicon.ico?v=2" />
      <meta name="apple-mobile-web-app-title" content="MiddCourses" />
      <meta name="application-name" content="MiddCourses" />
      <meta name="msapplication-TileColor" content="#2d89ef" />
      <meta name="msapplication-config" content="/favicons/browserconfig.xml?v=2" />
      <meta name="theme-color" content="#fafafa" />
      <meta name="keywords" content={keywords} ></meta>
      <meta name="content-language" content="en-us" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:image" content="https://midd.courses/images/middcourses-social-card.png" />

      {/*  Twitter  */}
      <meta property="twitter:card" content="summary_large_image" />
      {/* <meta property="twitter:image" content={`https://midd.courses/images/middcourses-social-card.png?utm_source${}}`} /> */}

      {/* Structured Data */}
      {/* <script type="application/ld+json">
        {`
          "@context": "https://schema.org",
          "@type": "Organization",
          "url": "https://midd.courses/",
          "logo": "https://midd.courses/favicon.svg"
        `
        }
      </script> */}
    </Head>
  );
}
