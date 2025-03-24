import { Prisma } from "@prisma/client";

function getUserDataSelectSimple() {
  return {
    id: true,
    name: true,
    image: true,
    displayName: true,
  } satisfies Prisma.UserSelect;
}
export function getUserDataSelect(loggedInUserId: string) {
  return {
    id: true,
    name: true,
    image: true,
    displayName: true,
    bio: true,
    createdAt: true,
    followers: {
      where: {
        followerId: loggedInUserId,
      },
      select: {
        followerId: true,
      },
    },
    _count: {
      select: {
        posts: true,
        followers: true,
      },
    },
  } satisfies Prisma.UserSelect;
}

export type UserData = Prisma.UserGetPayload<{
  select: ReturnType<typeof getUserDataSelect>;
}>;

export function getPostDataIncludeSimple() {
  return {
    user: {
      select: getUserDataSelectSimple(),
    },
  } satisfies Prisma.PostInclude;
}

export function getPostDataInclude(loggedInUserId: string) {
  return {
    user: {
      select: getUserDataSelect(loggedInUserId),
    },
  } satisfies Prisma.PostInclude;
}
export type PostData = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataInclude>;
}>;

export type PostDataSimple = Prisma.PostGetPayload<{
  include: ReturnType<typeof getPostDataIncludeSimple>;
}>;

export interface PostsPage {
  posts: PostData[];
  nextCursor: string | null;
}

export interface PostsPageSimple {
  posts: PostDataSimple[];
  nextCursor: string | null;
}

export interface FollowerInfo {
  followers: number;
  isFollowedByUser: boolean;
}
