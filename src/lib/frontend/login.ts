import { signIn } from "next-auth/react";

export default function signInRedirectHandler() {
    const pid = "google";
    signIn(pid);
}