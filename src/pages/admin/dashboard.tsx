import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useIsMount from "../../hooks/useIsMount";
import { __getAllFullUsers } from "../../lib/backend/database/users";
import { CustomSession } from "../../lib/common/types";
import signInRedirectHandler from "../../lib/frontend/login";

interface AdminDashboardProps {
    users: any[];

}


export async function getServerSideProps(context) {
    const session = await getSession(context) as CustomSession;

    //get all users

    //get all reviews


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


    const users = await __getAllFullUsers();


    return {
        props: {
            users: JSON.parse(JSON.stringify(users)),
        }
    }


}



function AdminDashboard({
    users

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




    console.log(users);



    return (
        <div>
            <h1>Admin Dashboard</h1>
            {/* Users table */}
            <div>
                <h2>Users</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Type</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            return (
                                <tr key={user.userEmail}>
                                    <td>{user.useremail}</td>
                                    <td>{user.userType}</td>
                                    <td>{user.createdAt}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            {/* Reviews table */}
        </div>
    )
}

export default AdminDashboard