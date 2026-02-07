import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { timingSafeEqual } from "crypto";


// Ensures constant-time comparison for strings
const safeCompare = (a, b) => {
  if (a.length !== b.length) return false;
  return timingSafeEqual(new Uint8Array(Buffer.from(a, "utf8")), new Uint8Array(Buffer.from(b, "utf8")));
};



import {
  checkIfUserExists,
  generateUser,
  getUserByEmail,
} from "../../../lib/backend/database-utils";
import { CustomSession } from "../../../lib/common/types";

async function signIn({ profile, user, account }) {
  console.log("Sign-in attempt:", { profile, user, account });

  if (account.provider === "credentials" && user.isAdminOverrideSession) {
    console.log("Admin override sign-in successful for user:", user.email);
    return true; // Allow sign-in for admin override sessions without further checks
  }


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
  const bool: boolean = await checkIfUserExists(user.email);

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

  console.log(`User ${user.email} signed in`);
  return true;
}

async function session({ session, user, token }): Promise<CustomSession> {
  if (token.isAdminOverrideSession) {
    console.log("Admin override session detected for user:", session.user.email);
    session.user.id = token?.user?.id;
    session.user.role = token?.user?.role;
    session.user.authorized = token?.user?.authorized;
    session.user.admin = token?.user?.admin;
    session.user.banned = token?.user?.banned;
    return session as CustomSession;
  }

  const u = await getUserByEmail(session.user.email);

  session.user.id = u?.userID;
  session.user.role = u?.userType;
  session.user.authorized = u?.canReadReviews as boolean;
  session.user.admin = u?.admin;
  session.user.banned = u?.banned;

  return session as CustomSession;
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
      checks: "state",
    }),
    // Admin credentials provider for service accounts
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Assumed Email", type: "text" },
        apiKey: { label: "API Key", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials, req) {
        console.log("Attempting admin sign in with credentials:", JSON.stringify(credentials));
        const { email, apiKey, role } = credentials;

        if (!email || !apiKey || !role) {
          throw new Error("Email, API key, and role are required");
        }

        if (!["student", "faculty"].includes(role)) {
          throw new Error("Invalid role");
        }

        // Compare API key with secret
        if (safeCompare(apiKey, process.env.ADMIN_API_KEY)) {

          // Email lookup for id matching, otherwise return a default admin user with id 0 (not ideal, but allows for flexibility in admin accounts without database entries)
          const existingUser = await getUserByEmail(email);
          if (existingUser) {
            return {
              id: existingUser.userID,
              email,
              role: existingUser.userType,
              authorized: existingUser.canReadReviews as boolean,
              admin: existingUser.admin,
              banned: existingUser.banned,
              isAdminOverrideSession: true, // Custom flag to identify admin sessions
            };
          }

          // Return a user object with admin role
          return {
            id: '00000000-0000-0000-0000-000000000000',
            email,
            role: "admin",
            authorized: true,
            admin: true,
            banned: false,
            isAdminOverrideSession: true, // Custom flag to identify admin sessions
          };
        }

        throw new Error("Invalid API key");

      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    signIn: signIn,
    session: session,
    redirect: redirect,
    jwt: async ({ token, user, account }) => {
      // If this is an admin override session, add the flag to the token
      if ((user as any)?.isAdminOverrideSession) {
        token.isAdminOverrideSession = true;
      }
      if (user) {
        token.user = user;
      }

      return token;
    }
  },
  pages: {
    newUser: "/auth/signup",
    signIn: "/auth/signin",
    signOut: "/auth/signout",
  },
});
