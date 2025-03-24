import prisma from "@/lib/prisma";
import { getPostDataIncludeSimple, PostsPageSimple } from "@/types/post";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const userId = (await params).userId;
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;
    const posts = await prisma.post.findMany({
      where: { userId },
      include: getPostDataIncludeSimple(),
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });
    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;
    const data: PostsPageSimple = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
