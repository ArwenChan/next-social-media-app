"use server";

import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/types/post";
import {
  updateUserProfileSchema,
  UpdateUserProfileValues,
} from "@/lib/validation";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function updateUserProfile(values: UpdateUserProfileValues) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  const user = session!.user;
  const validatedValues = updateUserProfileSchema.parse(values);
  const updatedUser = await prisma.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: user.id },
      data: validatedValues,
      select: getUserDataSelect(user.id),
    });
    return updatedUser;
  });

  return updatedUser;
}
