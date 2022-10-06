/**
 * React component that inserts custom configuration info to the page head.
 * @file add configuration info to head.
 * @author Nicholas Sliter
 *
 */

import Head from "next/head";

export default function CustomHead() {
  const title: string = "MiddCourses";

  return (
    <Head>
      <title>{title}</title>
      <link rel="icon" href="/favicon.svg" sizes="any" type="image/svg+xml" />
      <link rel="apple-touch-icon" sizes="180x180" href="/favicons/apple-touch-icon.png?v=2" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png?v=2" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png?v=2" />
      <link rel="manifest" href="/favicons/site.webmanifest?v=2" />
      <link rel="mask-icon" href="/favicons/safari-pinned-tab.svg?v=2" color="#1e66aa" />
      <link rel="shortcut icon" href="/favicons/favicon.ico?v=2" />
      <meta name="apple-mobile-web-app-title" content="MiddCourses" />
      <meta name="application-name" content="MiddCourses" />
      <meta name="msapplication-TileColor" content="#2d89ef" />
      <meta name="msapplication-config" content="/favicons/browserconfig.xml?v=2" />
      <meta name="theme-color" content="#fafafa" />
      <meta name="keywords" content={`Middlebury, MiddCourses, Course Reviews, Middlebury College, Course, Course Evaluations, Midd Courses `} ></meta>
    </Head>
  );
}


      // <link
      //   href="https://fonts.googleapis.com/css?family=Montserrat:300,400,600"
      //   rel="stylesheet"
      // ></link>
      // <link
      //   href="https://fonts.googleapis.com/css?family=Open+Sans:400"
      //   rel="stylesheet"
      // ></link>