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
};

export interface public_instructor {
  instructorID: string;
  name: string;
  slug: string;


}

//TODO: finish this
export interface User {
  userID: string;
  userType: string;
  banned: boolean;
  archived: boolean;
  email: string;
}


export interface Session {

  user: {
    name: string;
    email: string;
    image: string;
    id: string;
    role: string;
    authroized: boolean;
    admin: boolean;

  };

  expires: string;



}



export interface Department {
  departmentID: string;
  departmentName: string;
};



