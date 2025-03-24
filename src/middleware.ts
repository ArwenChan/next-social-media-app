import { auth } from "./auth";

export default auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: [
    "/((?!api/auth|api/uploadthing|_next/static|_next/image|.*\\.png$).*)",
  ],
};
