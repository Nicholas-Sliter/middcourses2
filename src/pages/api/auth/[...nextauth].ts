import NextAuth from "next-auth";
//import Auth0Provider from "next-auth/providers/auth0";
import GoogleProvider from "next-auth/providers/google";

import {
  checkIfUserExists,
  generateUser,
  getUserByEmail,
} from "../../../lib/backend/database-utils";
//import { canWriteReviews } from "../../../lib/backend/utils";

async function signIn({ profile, user, account }) {

  //validate the email is an email
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(profile.email)) {
    return Promise.reject(new Error("Invalid email"));
  }

  //check if the user has a midd email
  if (!user?.email?.endsWith("@middlebury.edu")) {
    return Promise.reject(
      new Error("You must use a Middlebury email to sign in")
    );
  }

  //make sure that the user is registered in the db and get role and id
  const bool = checkIfUserExists(user.email);

  if (!bool) {
    //do signup stuff
    try {
      await generateUser(user.email);
    } catch (e) {
      console.error(e);
      return Promise.reject(
        new Error("Something went wrong generating your account")
      );
    }
  }

  return true;
}

async function session({ session, user }) {
  const u = await getUserByEmail(session.user.email);

  session.user.id = u?.userID;
  session.user.role = u?.userType;
  session.user.authorized = u?.canReadReviews as boolean;
  //session.user.canWriteReviews = canWriteReviews(u.userID);
  session.user.admin = u?.admin;


  return session;
}

async function redirect({ url, baseUrl }) {
  return url.startsWith(baseUrl)
    ? Promise.resolve(url)
    : Promise.resolve(baseUrl);
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
    redirect: redirect,
  },
  pages: {
    newUser: "/auth/signup",
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
});
