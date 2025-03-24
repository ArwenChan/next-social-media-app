import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { FollowerInfo } from "@/types/post";

export async function GET(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = await params;
    const session = await auth();
    const loggedInUser = await session!.user;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: loggedInUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const session = await auth();
    const { userId } = await params;
    const loggedInUser = await session!.user;
    await prisma.$transaction([
      prisma.follow.upsert({
        where: {
          followerId_followingId: {
            followerId: loggedInUser.id,
            followingId: userId,
          },
        },
        create: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
        update: {},
      }),
      //   prisma.notification.create({
      //     data: {
      //       issuerId: loggedInUser.id,
      //       recipientId: userId,
      //       type: "FOLLOW",
      //     },
      //   }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const { userId } = await params;
    const session = await auth();
    const loggedInUser = await session!.user;
    await prisma.$transaction([
      // use deleteMany instead of delete to avoid error when the record doesn't exist
      prisma.follow.deleteMany({
        where: {
          followerId: loggedInUser.id,
          followingId: userId,
        },
      }),
      //   prisma.notification.deleteMany({
      //     where: {
      //       issuerId: loggedInUser.id,
      //       recipientId: userId,
      //       type: "FOLLOW",
      //     },
      //   }),
    ]);

    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
