import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

type Environment = "production" | "development" | "other";
export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const currentEnv = process.env.NODE_ENV as Environment;

  if (
    currentEnv === "production" &&
    req.headers.get("x-forwarded-proto") !== "https"
  ) {
    return NextResponse.redirect(
      `https://${req.nextUrl.hostname}${req.nextUrl.pathname}`,
      301
    );
  }
  return NextResponse.next();
}
