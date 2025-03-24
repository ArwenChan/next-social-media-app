"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";
import { getPostDataInclude, getPostDataIncludeSimple } from "@/types/post";
import { redirect } from "next/navigation";

export async function submitPost(input: { content: string }) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  const { content } = createPostSchema.parse(input);
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: session.user.id,
    },
    include: getPostDataInclude(session.user.id),
  });
  return newPost;
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new Error("Post not found");
  if (post.userId !== session.user.id) throw new Error("Unauthorized");
  const deletedPost = await prisma.post.delete({
    where: { id },
    include: getPostDataIncludeSimple(),
  });
  return deletedPost;
}
