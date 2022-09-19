import type { Session } from "next-auth";
export interface public_review {
  reviewID: string;
  courseID: string;
  instructorID: string;
  semester: string;
  reviewDate: string;
  rating: number;
  voteCount: number;
  content: string;
  difficulty: number;
  value: number;
  hours: number;
  again: boolean;
  primaryComponent: string;

  instructorEffectiveness: number;
  instructorAccomodationLevel: number;
  //swithc to understanding
  instructorEnthusiam: number;
  instructorAgain: boolean;
}


export interface public_course {
  courseID: string;
  courseName: string;
  courseDescription: string;
  departmentID?: string;
  instructorID?: string;
  term?: string;
  numReviews?: number;
};

export interface public_instructor {
  instructorID: string;
  name: string;
  email?: string;
  slug: string;
  departmentID?: string;


}

//TODO: finish this
export interface User {
  userID: string;
  userType: string;
  banned: boolean;
  archived: boolean;
  email: string;
}


export interface CustomSession extends Session {

  user: {
    name: string;
    email: string;
    image: string;
    id: string;
    role: string;
    authorized: boolean;
    admin: boolean;

  };

  expires: string;



}



export interface Department {
  departmentID: string;
  departmentName: string;
};



