"use server";

import { signIn } from "@/auth";
import prisma from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function signUp(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const { username, email, password } = signUpSchema.parse(
      Object.fromEntries(formData.entries()),
    );
    const existingUsername = await prisma.user.findFirst({
      where: {
        name: {
          equals: username,
          mode: "insensitive",
        },
      },
    });

    if (existingUsername) {
      return "Username already taken";
    }
    const existingEmail = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (existingEmail) {
      return "Email already taken";
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        name: username,
        displayName: username,
        email,
        password: passwordHash,
      },
    });
    formData.set("redirectTo", "/");
    await signIn("credentials", formData);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return "Something went wrong. Please try again.";
  }
}
