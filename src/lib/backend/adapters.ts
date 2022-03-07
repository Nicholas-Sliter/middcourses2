import type {
  Adapter,
  AdapterSession,
  AdapterUser,
  VerificationToken,
} from "next-auth/adapters";
import type { Account } from "next-auth";
import { generateUser, getUserByEmail, getUserByID } from "./database-utils";

/** @return { import("next-auth/adapters").Adapter } */

export default function CustomAdapter(client, options = {}) {
  return {
    async createUser(data) {
      try {
        const res = await generateUser(data.email);
        return res;
      } catch (e) {
        console.error(e);
      }
      return;
    },
    async getUser(id) {
      try {
        const res = await getUserByID(id);
        return res;
      } catch (e) {
        console.error(e);
      }
      return;
    },
    async getUserByEmail(email) {
      try {
        const res = await getUserByEmail(email);
        return res;
      } catch (e) {
        console.error(e);
      }
      return;
    },
    async getUserByAccount({ providerAccountId, provider }) {
      
      return;
    },
    async updateUser(user) {
      return;
    },
    async deleteUser(userId) {
      return;
    },
    async linkAccount(account) {
      return;
    },
    async unlinkAccount({ providerAccountId, provider }) {
      return;
    },
    async createSession({ sessionToken, userId, expires }) {
      return;
    },
    async getSessionAndUser(sessionToken) {
      return;
    },
    async updateSession({ sessionToken }) {
      return;
    },
    async deleteSession(sessionToken) {
      return;
    },
    async createVerificationToken({ identifier, expires, token }) {
      return;
    },
    async useVerificationToken({ identifier, token }) {
      return;
    },
  };
}
