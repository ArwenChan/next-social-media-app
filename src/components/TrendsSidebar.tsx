import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import UserAvatar from "@/components/UserAvatar";
import TrendingTopics from "./TrendingPosts";
import { cn } from "@/lib/utils";
import FollowButton from "./FollowButton";
import { getUserDataSelect } from "@/types/post";

interface TrendsSidebarProps {
  className?: string;
}
export default function TrendsSidebar({ className }: TrendsSidebarProps) {
  return (
    <div className={cn("space-y-5", className)}>
      <Suspense fallback={<Loader2 className="mx-auto animate-spin" />}>
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const session = await auth();
  const loggedUser = session!.user;
  const usersToFollow = await prisma.user.findMany({
    where: {
      NOT: {
        id: loggedUser.id,
      },
      followers: {
        none: {
          followerId: loggedUser.id,
        },
      },
    },
    select: getUserDataSelect(loggedUser.id),
    take: 5,
  });
  return (
    <div className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="text-xl font-bold">who to follow</div>
      {usersToFollow.map((user) => (
        <div key={user.id} className="flex items-center justify-center gap-3">
          <Link
            href={`/users/${user.name}`}
            className="flex items-center gap-3"
          >
            <UserAvatar avatarUrl={user.image} className="flex-none" />
            <div>
              <p className="line-clamp-1 break-all font-semibold hover:underline">
                {user.displayName}
              </p>
              <p className="line-clamp-1 break-all text-muted-foreground">
                @{user.name}
              </p>
            </div>
          </Link>
          <FollowButton
            userId={user.id}
            initialState={{
              followers: user._count.followers,
              isFollowedByUser: user.followers.some(
                ({ followerId }) => followerId === loggedUser.id,
              ),
            }}
          />
        </div>
      ))}
    </div>
  );
}
