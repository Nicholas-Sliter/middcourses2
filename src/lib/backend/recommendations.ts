import { CustomSession } from "../common/types";
import { getBaseRecommendationReviews } from "./database/recommendations";
import seedrandom from "seedrandom";
import cosineSimilarity from "./simularity";

type Review = {
    "reviewID": string,
    "reviewerID": string,
    "courseID": string,
    "instructorID": string,

    "rating": number,
    "difficulty": number,
    "value": number,
    "hours": number,
    "again": number,

    "instructorEffectiveness": number,
    "instructorAccommodationLevel": number,
    "instructorEnthusiasm": number,
    "instructorAgain": number,
    "instructorEnjoyed": number,

}
type ReviewDict = { [key: string]: Review };


type rNode = {
    id: string,
    type: string,
    entranceIndex: number,
}

type maps = {
    userToReview: { [key: string]: number[] },
    courseToReview: { [key: string]: number[] },
    instructorToReview: { [key: string]: number[] },
}

const instructorVectorKeys = [
    'instructorEffectiveness',
    'instructorAccommodationLevel', 'instructorEnthusiasm',
    'instructorAgain', 'instructorEnjoyed'
];

const courseVectorKeys = ['difficulty', 'hours', 'rating', 'value', 'again'];

const randomIndex = (distribution: number[], randomFun: Function) => {
    const index = Math.floor(distribution.length * randomFun());  // random index
    return distribution[index];
};

const randomWeightedItem = <T>(array: T[], distribution: number[], randomFun: Function) => {
    const index = randomIndex(distribution, randomFun);
    return array[index];
};

const randomUniformItem = <T>(array: T[], randomFun: Function) => {
    const index = Math.floor(array.length * randomFun());
    return array[index];
};

function normalizeReviews(reviews: Review[]): void {
    const keys = [...instructorVectorKeys, ...courseVectorKeys];

    const magnitudes = reviews.reduce((acc, review) => {
        keys.forEach(key => {
            acc[key] += review[key] ** 2;
        });

        return acc;
    }, {} as { [key: string]: number });

    keys.forEach(key => {
        magnitudes[key] = Math.sqrt(magnitudes[key]);
    });

    /* In-place normalization */
    reviews.forEach(review => {
        keys.forEach(key => {
            review[key] /= magnitudes[key];
        });

    });

}


function softmax(arr: number[]) {
    const max = Math.max(...arr);
    const exp = arr.map((x) => Math.exp(x - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    return exp.map((x) => x / sum);
}

function getNeighborIndices(node: rNode, maps: maps): number[] {
    const { id, type } = node;
    return maps[`${type}ToReview`][id].filter((i: number) => { return i !== node.entranceIndex }) || [];
}

function getNeigborProbabilites(node: rNode, reviews: Review[], neighborIndices: number[]): number[] {
    // const neighborIndices = getNeighborIndices(node, maps);

    if (neighborIndices.length === 0) {
        return [];
    }

    if (node.type === "user") {
        return [];
    }

    /* only defined for course and instructor nodes */
    const keys = node.type === "course" ? courseVectorKeys : instructorVectorKeys;

    const neighborVectors = neighborIndices.map(neighborIndex => {
        const neighborReview = reviews[neighborIndex];
        const neighborVector = keys.map(key => neighborReview[key]);
        return neighborVector;
    });

    const nodeVector = keys.map(key => reviews[node.entranceIndex][key]);

    const similarity = neighborVectors.map(neighborVector => {
        return cosineSimilarity(nodeVector, neighborVector);
    });

    const softmaxSimilarity = softmax(similarity);

    return softmaxSimilarity; // Index position corresponds to neighborIndices
}


/** COURSERANK ALGORITHM 
 * Random Walk With Restart
 * 
 * @param user_id The user to get recommendations for
 * @param top_k The max number of recommendations to return
 * @param top_m The max number of users to consider for the user neighborhood
 * @param reviews The reviews to use for the algorithm
 * @param maps The maps to use for the algorithm
 * @param restart_prob The probability of restarting the random walk
 * @param max_iter The maximum number of iterations to run the random walk
 * @param seed The seed for the random number generator
 * @param review_threshold The minimum number of reviews a course must have in the neighborhood to be considered
 * @param course_rating_threshold The minimum normalized rating a course must have in the neighborhood to be considered
 * 
 * @returns A sorted array of recommended course IDs
 */
function rwr(
    user_id: string,
    top_k: number,
    top_m: number,
    reviews: Review[],
    maps = {
        userToReview: {} as { [key: string]: number[] },
        courseToReview: {} as { [key: string]: number[] },
        instructorToReview: {} as { [key: string]: number[] },
    },
    restart_prob: number = 0.15,
    max_iter: number = 200,
    seed: number = 0,
    review_threshold: number = 1,
    course_rating_threshold: number = 0): string[] {


    const rng = seedrandom(seed);

    // Generate nodes lazily (only when needed)

    // Start at user node

    const user_node: rNode = {
        id: user_id,
        type: "user",
        entranceIndex: null,
    };
    const visited = new Map<string, number>();

    let current_node = Object.assign({}, user_node);
    let last_node = Object.assign({}, user_node);
    let last_edge = null;

    let iterNum = 0;
    while (iterNum < max_iter) {
        iterNum++;

        if (current_node.type === "user" && current_node.id !== user_node.id) {
            visited.set(current_node.id, (visited.get(current_node.id) || 0) + 1);
        }

        /* Randomly restart */
        if (rng.quick() < restart_prob) {
            current_node = Object.assign({}, user_node);
        }

        switch (current_node.type) {

            case "user": {
                // Random uniform selection
                const selectedReview = randomUniformItem(getNeighborIndices(current_node, maps), rng.quick);
                const review = reviews[selectedReview];
                const type = randomUniformItem(["course", "instructor"], rng.quick);
                const id = (type == "course") ? review.courseID : review.instructorID;
                //const reviewIndex = maps.userToReview[selectedReview];

                current_node = { id, type, entranceIndex: selectedReview };

                // current_node = new rNode(id,);
                continue;
            }

            default: { // course or instructor
                // Select using softmax cosine similarity
                const neighborIndices = getNeighborIndices(current_node, maps);
                const neighborProbabilities = getNeigborProbabilites(current_node, reviews, neighborIndices);

                const selectedReviewIndex = randomWeightedItem(neighborIndices, neighborProbabilities, rng.quick);
                const selectedReview = reviews[selectedReviewIndex];

                const type = "user";
                const id = selectedReview.reviewerID;
                const entranceIndex = selectedReviewIndex;

                current_node = { id, type, entranceIndex };

            }

        }

    }

    const courses = new Map<string, { count: number, sum: number }>();

    const userNeighborhood = Array
        .from(visited.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, top_m) // We only want to consider this many users
        .map(entry => entry[0]);

    userNeighborhood.forEach((entry, i) => {
        const userCourses = maps.userToReview[entry].map(reviewIndex => reviews[reviewIndex].courseID);
        userCourses.forEach(course => {
            // courses.set(course, (courses.get(course) || 0) + 1);
            const { count, sum } = courses.get(course) || { count: 0, sum: 0 };
            const userRating = reviews[maps.userToReview[entry][i]].rating;
            courses.set(course, { "count": count + 1, "sum": sum + userRating });
        });
    });

    /**
     * Entry[0] = courseID
     * Entry[1][0] = number of reviews
     * Entry[1][1] = sum of ratings
     */
    const sortedCourses: string[] = Array
        .from(courses.entries())
        .filter(entry => entry[1].count >= review_threshold) // Remove two few reviews in neighborhood
        .map(entry => { return { 'id': entry[0], 'avg': entry[1][1] / entry[1][0] } }) // Average rating
        .filter(entry => entry.avg >= course_rating_threshold) // Remove courses with average rating less than hyperparameter
        .sort((a, b) => b.avg - a.avg) // Sort by average rating
        .slice(0, top_k)
        .map(entry => entry.id); // Return course IDs

    return sortedCourses;

}



export async function getRecommendationsForUser(session: CustomSession) {

    const { user } = session;

    if (!user || !user.id || !user.authorized || user.role !== 'student') {
        return [];
    }

    const reviews = await getBaseRecommendationReviews(session);

    // Check user has enough reviews (at least 4)
    let count = 0;
    reviews.forEach(review => {
        if (review.reviewerID === user.id) {
            count++;
        }
    });

    if (count < 4) {
        return [];
    }

    normalizeReviews(reviews); //in-place normalization

    const users = new Set();
    const courses = new Set();
    const instructors = new Set();

    reviews.forEach(review => {
        users.add(review.reviewerID);
        courses.add(review.courseID);
        instructors.add(review.instructorID);
    });

    //needs maps for user -> course, user -> instructor

    // const maps = {
    //     userToCourse: {} as { [key: string]: Set<string> },
    //     userToInstructor: {} as { [key: string]: Set<string> },
    //     courseToUser: {} as { [key: string]: Set<string> },
    //     instructorToUser: {} as { [key: string]: Set<string> },
    // };

    // reviews.forEach(review => {
    //     if (!maps.userToCourse[review.reviewerID]) {
    //         maps.userToCourse[review.reviewerID] = new Set();
    //     }
    //     if (!maps.userToInstructor[review.reviewerID]) {
    //         maps.userToInstructor[review.reviewerID] = new Set();
    //     }
    //     if (!maps.courseToUser[review.courseID]) {
    //         maps.courseToUser[review.courseID] = new Set();
    //     }
    //     if (!maps.instructorToUser[review.instructorID]) {
    //         maps.instructorToUser[review.instructorID] = new Set();
    //     }

    //     maps.userToCourse[review.reviewerID].add(review.courseID);
    //     maps.userToInstructor[review.reviewerID].add(review.instructorID);
    //     maps.courseToUser[review.courseID].add(review.reviewerID);
    //     maps.instructorToUser[review.instructorID].add(review.reviewerID);
    // });

    // Store userid -> [review indices] in a map
    // Store courseid -> [review indices] in a map
    // Store instructorid -> [review indices] in a map

    const userToReviews = {} as { [key: string]: number[] };
    const courseToReviews = {} as { [key: string]: number[] };
    const instructorToReviews = {} as { [key: string]: number[] };

    reviews.forEach((review, index) => {
        if (!userToReviews[review.reviewerID]) {
            userToReviews[review.reviewerID] = [];
        }
        if (!courseToReviews[review.courseID]) {
            courseToReviews[review.courseID] = [];
        }
        if (!instructorToReviews[review.instructorID]) {
            instructorToReviews[review.instructorID] = [];
        }

        userToReviews[review.reviewerID].push(index);
        courseToReviews[review.courseID].push(index);
        instructorToReviews[review.instructorID].push(index);
    });


    const maps = {
        userToReview: userToReviews,
        courseToReview: courseToReviews,
        instructorToReview: instructorToReviews,
    };

    const recommendations = rwr(user.id, 10, 100, reviews, maps, 0.15, 200, 0, 2, 0);


    return recommendations;















}