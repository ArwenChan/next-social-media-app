"use server";

import { signOut } from "@/auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function logout() {
  try {
    await signOut({ redirectTo: "/login" });
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    } else {
      console.log(error);
    }
  }
}
