import knex from "./knex";
import { uuidv4 } from "../utils";
import { Scraper } from "directory.js";
import { checkIfFirstSemester } from "../../common/utils";
import { User } from "../../common/types";


/**
 * Return the user associated with a user id
 * @authentication {self or admin}
 * @param id a user id
 * @returns
 */

export async function getUserByID(id: string) {
    const user = await knex("User")
        .where({
            userID: id,
        })
        .first()
        .select(["userID", "userEmail", "userType", "canReadReviews"]);

    if (!user) {
        return null;
    }

    return user;
}

/**
 * @authentication {self only}
 * */
export async function getUserByEmail(email: string) {
    const user = await knex("User")
        .where({
            userEmail: email,
        })
        .first()
        .select(["userID", "userEmail", "userType", "canReadReviews", "admin"]);

    if (!user) {
        return null;
    }

    return user;
}

/**
* Check if a user has already been created.
* @param email
* @returns boolean if the user exists
*/
export async function checkIfUserExists(email: string) {
    const user = await getUserByEmail(email);
    if (!user) {
        return false;
    }

    return true;
}



/** */
export async function generateUser(email: string) {
    const user = {
        userEmail: email,
        userID: uuidv4(),
        userType: "",
        canReadReviews: false,
        graduationYear: "",
        createdAt: new Date().toISOString(),
    };

    //get verified user info from the Middlebury directory
    const S = new Scraper(email);
    await S.init();

    user.userType = S.person.type.toLowerCase() ?? "student";
    user.graduationYear = S.person?.gradYear ?? null;
    //user.departmentID = departmentNameMapping[S.person?.department] ?? null;

    user.canReadReviews = checkIfFirstSemester(user?.graduationYear ?? null)
        ? true
        : false;

    if (user.userType === "faculty") {
        user.canReadReviews = true;
    }

    const result = await knex("User").insert(user).returning("*");

    if (!result) {
        throw new Error("Failed to create user");
    }

    return result;
}


export async function __getAllUsers() {
    // if (process.env.NODE_ENV === "production") {
    //     throw new Error("This function is only for development purposes.");
    // }

    return await knex("User").select([
        "userID",
        "userEmail",
        "userType",
        "canReadReviews",
        "graduationYear",
    ]);
}


/**
 * Return all full users
 * @authentication {backend only}
 * @param
 * @returns
 */

export async function __getAllFullUsers() {
    const users = await knex("User")
        .select("*");

    if (!users) {
        return [];
    }

    return users;
}



/**
 * Return the full user associated with a user id
 * @authentication {backend only}
 * @param id a user id
 * @returns
 */

export async function __getFullUserByID(id: string) {
    const user = await knex("User")
        .where({
            userID: id,
        })
        .first()
        .select("*");

    if (!user) {
        return null;
    }

    return user;
}




/**
 * Run after a user has been modified or on a schedule to update relevant values in the database.
 *
 */
export async function updateUserCheck(id: string) {
    //recheck if the user can read reviews
    const user = await __getFullUserByID(id);
    if (!user) {
        throw new Error("User does not exist");
    }

    if (user.numReviews >= 2) {
        user.canReadReviews = true;
    } else {
        user.canReadReviews = false;
    }

    if (user.userType === "faculty") {
        user.canReadReviews = true;
    }

    if (checkIfFirstSemester(user.graduationYear)) {
        user.canReadReviews = true;
    }

    const result = await knex("User").where({ userID: user.userID }).update({
        canReadReviews: user.canReadReviews,
    });

    if (!result) {
        throw new Error("Failed to update user");
    }
}
