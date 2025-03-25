import { auth } from "@/auth";
import UserAvatar from "@/components/UserAvatar";
import prisma from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/types/post";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { formatDate } from "date-fns";
import FollowButton from "@/components/FollowButton";
import EditProfileButton from "./EditProfileButton";
import { formatNumber } from "@/lib/utils";
import FollowerCount from "@/components/FollowerCount";
import UserPosts from "./UserPosts";
import Linkify from "@/components/Linkify";

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      name: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });
  if (!user) {
    notFound();
  }
  return user;
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const session = await auth();
  const loggedInUserId = session!.user.id;
  const user = await getUser(username, loggedInUserId);
  return {
    title: `${user.displayName} (@${user.name})`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await auth();
  const loggedInUserId = session!.user.id;
  const user = await getUser(username, loggedInUserId);

  return (
    <div className="w-full min-w-0 space-y-5">
      <UserProfile user={user} loggedInUserId={loggedInUserId} />
      <div className="rounded-2xl bg-card p-5 shadow-sm">
        <h2 className="text-center text-2xl font-bold">
          {user.displayName}&apos;s posts
        </h2>
      </div>
      <UserPosts userId={user.id} />
    </div>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.image}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.name}</div>
          </div>
          <div>Member since {formatDate(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
