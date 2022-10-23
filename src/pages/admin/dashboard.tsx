import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useIsMount from "../../hooks/useIsMount";
import { CustomSession } from "../../lib/common/types";
import signInRedirectHandler from "../../lib/frontend/login";

interface AdminDashboardProps {

}


export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;


    if (!session) {
        return {
            redirect: {
                destination: "/auth/signin",
                permanent: false,
            }
        }
    }

    if (!session?.user?.admin) {
        return {
            redirect: {
                destination: "/",
                permanent: false,
            }
        }
    }

    return {
        props: {}
    }


}



function AdminDashboard({

}: AdminDashboardProps) {


    const { data: session } = useSession() as { data: CustomSession };
    const router = useRouter();
    const isMount = useIsMount();

    useEffect(() => {
        //if not logged in, redirect to login
        if (isMount && (!session || !session.user)) {
            //router.push("/login");
            //signInRedirectHandler();
        }
        //if not admin, redirect to home
        else if (isMount && !session?.user?.admin) {
            router.push("/");
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, isMount]);








    return (
        <div>
            <h1>Admin Dashboard</h1>
        </div>
    )
}

export default AdminDashboard