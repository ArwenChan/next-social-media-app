"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import { PostsPageSimple } from "@/types/post";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { ZodNull } from "zod";

interface UserPostsProps {
  userId: string;
}

export default function UserPosts({ userId }: UserPostsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<PostsPageSimple>({
    queryKey: ["post-feed", "user-posts", userId],
    queryFn: async ({ pageParam }) => {
      const url = pageParam
        ? `/api/users/${userId}/posts?cursor=${pageParam}`
        : `/api/users/${userId}/posts`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Request failed with status code ${res.status}`);
      }
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const posts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) || [],
    [data],
  );
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }

  if (status === "success" && !posts.length && !hasNextPage) {
    return (
      <p className="text-center text-muted-foreground">
        The user hasn't posted anything yet.
      </p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading posts.
      </p>
    );
  }
  return (
    <InfiniteScrollContainer
      className="space-y-5"
      onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
    >
      {posts.map((post) => (
        <Post key={post.id} post={post} withTooltip={false} />
      ))}
      {isFetchingNextPage && <Loader2 className="mx-auto my-3 animate-spin" />}
    </InfiniteScrollContainer>
  );
}
