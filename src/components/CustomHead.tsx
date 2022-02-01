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
      <link rel="icon" href="/favicon.svg" />
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