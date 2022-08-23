import process, { env } from "process";

const likeOperator = process.env.NODE_ENV === "production" ? "ilike" : "like";

export { likeOperator };