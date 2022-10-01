import type { Session } from "next-auth";
export interface public_review {
  reviewID: string;
  courseID: string;
  instructorID: string;
  semester: string;
  reviewDate: string;
  rating: number;
  content: string;
  difficulty: number;
  value: number;
  hours: number;
  again: boolean;
  primaryComponent: string;
  tags: string[];

  instructorEffectiveness: number;
  instructorAccommodationLevel: number;
  //swithc to understanding
  instructorEnthusiasm: number;
  instructorAgain: boolean;
  votes?: number;
  userVoteType?: 1 | -1;
}


export interface public_course {
  courseID: string;
  courseName: string;
  courseDescription: string;
  departmentID?: string;
  instructorID?: string;
  term?: string;
  numReviews?: number | string;
  avgRating?: number;
  avgDifficulty?: number;
  avgHours?: number;
  avgValue?: number;
  avgAgain?: number
  topTags?: string[];
};

export interface public_instructor {
  instructorID: string;
  name: string;
  email?: string;
  slug: string;
  departmentID?: string;
  avgEffectiveness?: number;
  avgAccommodationLevel?: number;
  avgEnthusiasm?: number;
  avgAgain?: number;
  numReviews?: number;
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
    banned?: boolean;

  };

  expires: string;



}



export interface Department {
  departmentID: string;
  departmentName: string;
};



