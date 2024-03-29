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

    "whyTake": string,
    "inMajorMinor": string,

}
type ReviewDict = { [key: string]: Review };


type rNode = {
    id: string,
    type: string,
    entranceIndex: number,
}

type maps = {
    userToReview: Map<string, number[]>,
    courseToReview: Map<string, number[]>,
    instructorToReview: Map<string, number[]>
}

const instructorVectorKeys = [
    'instructorEffectiveness',
    'instructorAccommodationLevel', 'instructorEnthusiasm',
    'instructorAgain', 'instructorEnjoyed', 'inMajorMinor'
];

const courseVectorKeys = ['difficulty', 'hours', 'rating', 'value', 'again', 'whyTake', 'inMajorMinor'];

const keyWeights = {
    'instructorEffectiveness': 1,
    'instructorAccommodationLevel': 1,
    'instructorEnthusiasm': 1,
    'instructorAgain': 2,
    'instructorEnjoyed': 1,
    'difficulty': 1,
    'hours': 1,
    'rating': 1,
    'value': 1,
    'again': 2,
    'whyTake': 1,
    'inMajorMinor': 1.5,
}

/** 
 * Activation function that takes x: (0, 1] and returns a value in (0, 1]
 * \frac{\left(\left(x+0.5\right)^{5}-0.0313\right)}{2.034\left(e+x\right)}
 */
const activationFunction = (x: number) => {
    return Math.max((Math.pow((x + 0.5), 5) - 0.0313) / (2.034 * (Math.E + x)), 0);

}

const randomIndex = (distribution: number[], randomFun: Function) => {
    const index = Math.floor(distribution.length * randomFun());  // random index
    return index;
};

const randomWeightedItem = <T>(array: T[], distribution: number[], randomFun: Function) => {


    if (distribution.length === 1) {
        return array[0];
    }

    const cdf = [];
    distribution.forEach((prob, index) => {
        if (index === 0) {
            cdf.push(prob);
        } else {
            cdf.push(prob + cdf[index - 1]);
        }
    });

    // We can probably do this in place...

    // Note CDF index is equivalent to sortedDistribution index

    const randomValue = randomFun();
    const index = cdf.findIndex(value => value >= randomValue);
    //what if index doesn't exist??

    // return array[sortedDistribution[index].index];
    return array[index];

};
const randomUniformItem = <T>(array: T[], randomFun: Function) => {
    const index = Math.floor(array.length * randomFun());
    return array[index];
};


function standardizeReviews(reviews: Review[]): void {
    // Subtract the mean from each key then divide by the standard deviation
    const keys = new Set([...instructorVectorKeys, ...courseVectorKeys]);
    const catToNumMap = {
        'whyTake': {
            /* "Requirements" of some sort  */
            'Required for Major/Minor': 0,
            'Pre-requisite for later courses': 0,
            'Distribution elective': 0,
            'Needed to fill schedule': 0,

            /* Interests */
            'Specific interest': 1,
            'To try something new': 1,
            'Someone recommended it': 1,
            'Elective for Major/Minor': 1,

            'Other': 2,

        },
        'inMajorMinor': {
            'major': 2,
            'minor': 1,
            'neither': 0,
        }

    }

    /* Convert keys to appropriate types */
    reviews.forEach(review => {
        keys.forEach(key => {

            if (catToNumMap[key]) {
                review[key] = catToNumMap[key][review[key]];
                return;
            }
            if (typeof review[key] === "string") {
                review[key] = parseInt(review[key], 10);
                return;
            }
            if (typeof review[key] === "boolean") {
                review[key] = +review[key];
                return;
            }
        });
    });


    /* Calculate the mean */
    const means = reviews.reduce((acc, review) => {
        keys.forEach(key => {
            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key] += review[key];
        });
        return acc;
    }, {} as { [key: string]: number });

    keys.forEach(key => {
        means[key] /= reviews.length;
    });

    /* Find STD */
    const stds = reviews.reduce((acc, review) => {
        keys.forEach(key => {
            if (!acc[key]) {
                acc[key] = 0;
            }
            acc[key] += (review[key] - means[key]) ** 2;
        });
        return acc;
    }, {} as { [key: string]: number });

    keys.forEach(key => {
        stds[key] = Math.sqrt(stds[key] / reviews.length);
    });

    /* In-place standardization */
    reviews.forEach(review => {
        keys.forEach(key => {
            const weight = keyWeights[key] ?? 1;
            review[key] = weight * (review[key] - means[key]) / stds[key];
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
    return maps[`${type}ToReview`].get(id).filter((i: number) => { return i !== node.entranceIndex }) || [];
}

function getNeighborProbabilites(node: rNode, reviews: Review[], neighborIndices: number[]): { index: number, probability: number }[] {
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

    // Need to remove any similarity values that are negative or 0
    // This is fine as these vectors are dissimilar and should not be considered

    const filteredSimilarity = similarity.map((value, index) => ({ value, index })).filter(item => item.value > 0);

    const activatedSimilarity = filteredSimilarity.map(item => ({ value: activationFunction(item.value), index: item.index }));

    const softmaxSimilarity = softmax(activatedSimilarity.map(item => item.value));

    return softmaxSimilarity.map((probability, index) =>
    ({
        index: filteredSimilarity[index].index,
        probability
    }));
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
        userToReview: {} as Map<string, number[]>,
        courseToReview: {} as Map<string, number[]>,
        instructorToReview: {} as Map<string, number[]>,
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

                if (!review) {
                    current_node = Object.assign({}, user_node);
                    continue;
                }

                const type = randomUniformItem(["course", "instructor"], rng.quick);
                const id = (type == "course") ? review.courseID : review.instructorID;

                current_node = { id, type, entranceIndex: selectedReview };

                continue;
            }

            default: { // course or instructor
                // Select using softmax cosine similarity
                const neighborIndices = getNeighborIndices(current_node, maps);
                const neighborProbabilities = getNeighborProbabilites(current_node, reviews, neighborIndices);

                if (neighborProbabilities.length === 0) {
                    //restart
                    current_node = Object.assign({}, user_node);
                    continue;
                }

                const selectedNeighborIndex = randomWeightedItem(neighborProbabilities.map(item => item.index), neighborProbabilities.map(item => item.probability), rng.quick);
                const selectedReviewIndex = neighborIndices[selectedNeighborIndex];
                const selectedReview = reviews[selectedReviewIndex];

                if (!selectedReview) {
                    //restart
                    current_node = Object.assign({}, user_node);
                    continue;
                }


                const type = "user";
                const id = selectedReview.reviewerID;
                const entranceIndex = selectedReviewIndex;

                current_node = { id, type, entranceIndex };

                continue;

            }

        }

    }

    /**
     * ucount: number of unique users who like the course
     * wcount: weighted number of users who like the course by the number of times the user was visited
     * sum: sum of the ratings of the course
     */
    const courses = new Map<string, { ucount: number, wcount: number, sum: number }>();

    const userNeighborhoodThreshold = Math.floor(Math.sqrt(max_iter) / 10); /* Filter out noise by removing nodes infrequently visited */
    const userNeighborhood = Array
        .from(visited.entries())
        .filter(([_, count]) => count >= userNeighborhoodThreshold)
        .sort((a, b) => b[1] - a[1])
        .slice(0, top_m) /* Only consider at max top m users */

    userNeighborhood.forEach(([entry, entryCount]) => {
        const userCourses = maps.userToReview.get(entry).map(reviewIndex => reviews[reviewIndex].courseID);

        userCourses.forEach((course, i) => {
            const { ucount, wcount, sum } = courses.get(course) || { ucount: 0, wcount: 0, sum: 0 };
            const userRating = reviews[maps.userToReview.get(entry)[i]].rating;
            courses.set(course, { ucount: ucount + 1, "wcount": wcount + entryCount, "sum": sum + (entryCount * userRating) });
        });
    });

    const usersCourses = maps.userToReview.get(user_id).map(reviewIndex => reviews[reviewIndex].courseID);

    const sortedCourses: string[] = Array
        .from(courses.entries())
        .filter(entry => entry[1].ucount >= review_threshold) // Remove two few reviews in neighborhood
        .filter(entry => !usersCourses.includes(entry[0])) // Remove courses already taken
        .filter(entry => !entry[0].startsWith('FYSE')) // Remove any FYSE courses
        .map(entry => ({ 'id': entry[0], 'avg': entry[1].sum / entry[1].wcount })) // Average rating
        .filter(entry => entry.avg >= course_rating_threshold) // Remove courses with average rating less than hyperparameter
        .sort((a, b) => b.avg - a.avg) // Sort by average rating
        .slice(0, top_k)
        .map(entry => entry.id); // Return course IDs

    return sortedCourses;

}


interface Recommendations {
    message: string;
    error: boolean;
    courses: string[];
    data?: any;
}

export async function getRecommendationsForUser(session: CustomSession, numRecs: number = 10, seed: number = 0, numIters: number = 200): Promise<Recommendations> {

    if (!session) {
        return { message: "Not logged in", error: true, courses: [] };
    }

    const { user } = session;

    if (!user || !user.id) {
        return { message: "Not logged in", error: true, courses: [] };
    }

    if (user?.banned === true) {
        return { message: "Banned", error: true, courses: [] };
    }

    if (user.role !== 'student') {
        return { message: "Not student", error: true, courses: [] };
    }

    const reviews: Review[] = await getBaseRecommendationReviews(session) as Review[];

    // Check user has enough reviews (at least 4)
    let count = 0;
    reviews.forEach(review => {
        if (review.reviewerID === user.id) {
            count++;
        }
    });

    if (count < 4) {
        console.log("Not enough reviews")
        return { message: "Not enough reviews", error: true, courses: [], data: { count } };
    }

    /**
     * This needs to be after review check
     */
    if (!user.authorized) {
        return { message: "Missing semester reviews", error: true, courses: [] };
    }

    standardizeReviews(reviews); //in-place standardization

    const users = new Set();
    const courses = new Set();
    const instructors = new Set();

    reviews.forEach(review => {
        users.add(review.reviewerID);
        courses.add(review.courseID);
        instructors.add(review.instructorID);
    });


    // const userToReviews = {} as { [key: string]: number[] };
    const userToReviewsMap = new Map<string, number[]>();
    // const courseToReviews = {} as { [key: string]: number[] };
    const courseToReviewsMap = new Map<string, number[]>();
    // const instructorToReviews = {} as { [key: string]: number[] };
    const instructorToReviewsMap = new Map<string, number[]>();

    reviews.forEach((review, index) => {
        if (!userToReviewsMap.has(review.reviewerID)) {
            userToReviewsMap.set(review.reviewerID, []);
        }
        if (!courseToReviewsMap.has(review.courseID)) {
            courseToReviewsMap.set(review.courseID, []);
        }
        if (!instructorToReviewsMap.has(review.instructorID)) {
            instructorToReviewsMap.set(review.instructorID, []);
        }

        userToReviewsMap.get(review.reviewerID).push(index);
        courseToReviewsMap.get(review.courseID).push(index);
        instructorToReviewsMap.get(review.instructorID).push(index);
    });


    const maps = {
        userToReview: userToReviewsMap,
        courseToReview: courseToReviewsMap,
        instructorToReview: instructorToReviewsMap,
    };


    const maxUserNeighborhood = 50;
    const restartAlpha = 0.16;
    const reviewThreshold = 2; // Minimum number of reviews a course must have (in neighorhood) to be considered
    const courseRatingThreshold = -0.0000001; // Minimum average rating a course must have (in neighorhood) to be considered
    // this is a hack to get around the fact that the average rating of a course is 0.0 from the standardization
    // but because of floating point errors, it might not be exactly 0.0

    // const recommendations = rwr(user.id, 10, 100, reviews, maps, 0.12, 400, 0, 2, -0.0000001);
    const recommendations = rwr(user.id,
        numRecs,
        maxUserNeighborhood,
        reviews,
        maps,
        restartAlpha,
        numIters,
        seed,
        reviewThreshold,
        courseRatingThreshold);


    return {
        message: (recommendations.length) ? "Success" : "No recommendations found",
        error: (recommendations.length) ? false : true,
        courses: recommendations
    };

}
