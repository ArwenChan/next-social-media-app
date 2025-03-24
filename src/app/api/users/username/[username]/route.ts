import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { getUserDataSelect } from "@/types/post";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const session = await auth();
    const loggedInUser = session!.user;
    const username = (await params).username;
    const user = await prisma.user.findFirst({
      where: {
        name: {
          equals: username,
          mode: "insensitive",
        },
      },
      select: getUserDataSelect(loggedInUser.id),
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
