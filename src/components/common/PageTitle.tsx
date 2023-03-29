/**
 * React component that inserts a page title into the page head to allow page-by-page custom titles.
 * @file add page title to head.
 * @author Nicholas Sliter
 * 
 */


import Head from "next/head";
import { public_course } from "../../lib/common/types";
import { parseCourseID, slugify } from "../../lib/common/utils";

type PageTitleProps = {
  pageTitle?: string;
  description?: string;
  courses?: public_course[];
  socialImage?: string;
  canonicalURL?: string;
};

export default function PageTitle({ pageTitle, description, courses, socialImage, canonicalURL }: PageTitleProps) {
  const title: string = pageTitle
    ? `${pageTitle} | MiddCourses`
    : "MiddCourses";

  const metaDescription = description ? description : "MiddCourses is Middlebury's premier course discovery and anonymous course review platform. Browse our complete catalogue to discover Middlebury's top professors, courses, and departments.";

  const pageTitleSlug = slugify(pageTitle);

  if (!socialImage) {
    socialImage = "https://midd.courses/images/middcourses-social-card.png";
  }


  const canonicalLink = canonicalURL ?
    <link rel="canonical" href={canonicalURL} /> :
    null;


  let courseStructuredData = [];

  if (courses) {

    courseStructuredData = courses.map((course) => {
      const { department, courseNumber } = parseCourseID(course.courseID);

      return {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": course.courseName,
        "description": course.courseDescription,
        "provider": {
          "@type": "Organization",
          "name": "Middlebury College",
          "sameAs": "https://www.middlebury.edu/"
        },
        "courseCode": course.courseID,
        "url": `https://midd.courses/reviews/${department?.toLowerCase()}/${courseNumber}`,
        "image": socialImage,
        "aggregateRating": (course.avgRating && course.numReviews) ? {
          "@type": "AggregateRating",
          "ratingValue": parseFloat(course?.avgRating?.toFixed(1)) ?? null,
          "bestRating": 10,
          "worstRating": 0,
          "reviewCount": course.numReviews ?? 0
        } : null
      }
    });


  }


  if (courses?.length > 1) {
    // need to include ItemList and ListItem around the courseStructuredData
    courseStructuredData = [{
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": courseStructuredData.map((course, index) => {
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": course
        }
      }
      )
    }]
  }



  return (
    <Head>
      <title key={"title"}>{title}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={socialImage} />


      {/*  Twitter  */}
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={metaDescription} />
      <meta property="twitter:image" content={`${socialImage}?utm_source=${pageTitleSlug}`} />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseStructuredData?.[0]) }} />

      {canonicalLink}
    </Head>

  );
}

