import NextAuth from "next-auth";
//import Auth0Provider from "next-auth/providers/auth0";
import GoogleProvider from "next-auth/providers/google";

import {getUserByEmail} from "../../../lib/backend/database-utils";



async function signIn({profile, user, account}) {


  //validate the email is of the correct format




  //check if the user has a midd email
  if (!user?.email?.endsWith("@middlebury.edu")) {
    return Promise.reject(new Error("You must use a Middlebury email to sign in"));
  }

  //check that the user is registered in the db and get role and id
  const u = await getUserByEmail(user.email);

  if(!u){
    //do signup stuff
    

  }

  return true;
}



async function session({session, user}){

  //session.user.id = user.id;
  //session.user.role = user.role;
  //session.user.email = user.email;

  //add userid to session 

  //console.log("session user", session.user);
  const u = await getUserByEmail(session.user.email);
  //console.log(u);

  session.user.id = u.userID;
  session.user.role = u.userType;
  session.user.authorized = u.canReadReviews as boolean;
  console.log(session.user);

  return session;


}




export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    signIn: signIn,
    session: session,
  },
  pages: {
    newUser: "/auth/signup",
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
});

