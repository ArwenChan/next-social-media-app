import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/types/post";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const posts = await prisma.post.findMany({
      include: getPostDataInclude(session!.user.id),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const data: PostsPage = { posts: posts.slice(0, pageSize), nextCursor };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
