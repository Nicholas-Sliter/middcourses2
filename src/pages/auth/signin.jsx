import { getProviders, signIn, useSession } from "next-auth/react";
import Router from "next/router";


export default function SignIn({ providers }) {
  const url = typeof window !== "undefined" ? window.location.href : "";
  const adminLogin = new URLSearchParams(url.split("?")[1]).get("adminLogin") === "true";

  const { data: session, status } = useSession()
  if (status === "authenticated") {
    Router.push("/");
  }



  return (
    <>
      {Object.values(providers).map((provider) => {
        if (!adminLogin && provider.id === "credentials") {
          return null; // Don't show credentials provider on regular login page
        }

        if (adminLogin && provider.id === "credentials") {
          // Render login form
          return (
            <div key={provider.name}>
              <h2>Admin Login</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const apiKey = e.target.apiKey.value;
                const role = e.target.role.value;
                signIn(provider.id, { email, apiKey, role });
              }
              }>
                <div>
                  <label htmlFor="email">Email:</label>
                  <input type="text" id="email" name="email" required />
                </div>
                <div>
                  <label htmlFor="apiKey">API Key:</label>
                  <input type="password" id="apiKey" name="apiKey" required />
                </div>
                <div>
                  <label htmlFor="role">Role:</label>
                  <input type="text" id="role" name="role" required />
                </div>
                <button type="submit">Sign in with {provider.name}</button>
              </form>
            </div>
          )
        }

        return (
          <div key={provider.name}>
            <button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </button>
          </div>
        )
      })}
    </>
  );
}


export async function getServerSideProps(context) {
  const providers = await getProviders();
  console.log(providers);
  return {
    props: { providers },
  };
}
