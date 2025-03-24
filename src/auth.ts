import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import { loginSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 3 * 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, account, user }) {
      if (account) {
        token.id = user?.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl, method } }) {
      const isLoggedIn = !!auth?.user;
      const path = nextUrl.pathname;
      if (path.startsWith("/login") || path.startsWith("/signup")) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      } else if (!isLoggedIn) {
        if (path.startsWith("/api")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        } else if (method === "POST") {
          // don't handle this for a server action.
          return true;
        }
        return false;
      }
      return true;
    },
  },
  providers: [
    credentials({
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await prisma.user.findUnique({ where: { email } });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }
        return null;
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
});
