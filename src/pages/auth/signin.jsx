import { getProviders, signIn, useSession } from "next-auth/react";
import Router from "next/router";

export default function SignIn({ providers }) {

  const { data: session, status } = useSession()
  if (status === "authenticated") {
    Router.push("/");
  }


  return (
    <>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
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
