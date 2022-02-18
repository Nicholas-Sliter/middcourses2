import NextAuth from "next-auth";
//import Auth0Provider from "next-auth/providers/auth0";
import GoogleProvider from "next-auth/providers/google";





async function signIn({profile, user, account}) {


  //validate the email is of the correct format




  //check if the user has a midd email
  if (!user?.email?.endsWith("@middlebury.edu")) {
    return Promise.reject(new Error("You must use a Middlebury email to sign in"));
  }

  //check that the user is registered in the db and get role and id






  return true;
}



async function session({session, token, user}){



}




const options = {
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
  database: process.env.DATABASE_URL,
  pages: {
    newUser: "/",
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
};


export default (req, res) => NextAuth(req, res, options);