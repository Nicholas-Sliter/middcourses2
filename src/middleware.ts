import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

type Environment = "production" | "development" | "other";
export function middleware(req: NextRequest, ev: NextFetchEvent) {
    const currentEnv = process.env.NODE_ENV as Environment;

    /* HTTPS redirect */
    if (
        currentEnv === "production" &&
        req.headers.get("x-forwarded-proto") !== "https"
    ) {
        return NextResponse.redirect(
            `https://${process.env.HOST_NAME}${req.nextUrl.pathname}`,
            301
        );
    }

    /* Heroko URL redirect */
    if (currentEnv == "production" && process.env.HEROKU_APP_NAME && req.headers.get("host") === `${process.env.HEROKU_APP_NAME}.herokuapp.com`) {
        return NextResponse.redirect(
            `https://${process.env.HOST_NAME}${req.nextUrl.pathname}`,
            301
        );
    }


    return NextResponse.next();
}
