import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { deletePost, submitPost } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { PostsPage } from "@/types/post";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const loggedInUserId = session!.user.id;

  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      const queryFilter = {
        queryKey: ["post-feed"],
        predicate(query) {
          return (
            query.queryKey.includes("for-you") ||
            (query.queryKey.includes("user-posts") &&
              query.queryKey.includes(loggedInUserId))
          );
        },
      } satisfies QueryFilters<InfiniteData<PostsPage, string | null>>;
      // cancel the running query,
      // if we modify the cache when a nextPage fetching is running,
      // it's hard to control which change go first.
      await queryClient.cancelQueries(queryFilter);

      // add the new post to the top of the cached data.
      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );

      // invalidate the query when there isn't any data yet,
      // which will happen when the initial fetch is still going.
      // this will invoke a refetch.
      queryClient.invalidateQueries<
        QueryFilters<InfiniteData<PostsPage, string | null>>
      >({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return queryFilter.predicate(query) && !query.state.data;
        },
      });

      toast({
        description: "Post created",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Failed to post. Please try again.",
      });
    },
  });

  return mutation;
}

export function useDeletePostMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const router = useRouter();
  const pathname = usePathname();

  const mutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async (deletedPost) => {
      const queryFilter = { queryKey: ["post-feed"] };
      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.filter((p) => p.id !== deletedPost.id),
            })),
          };
        },
      );

      toast({
        description: "Post deleted",
      });

      if (pathname === `/posts/${deletedPost.id}`) {
        router.push(`/users/${deletedPost.user.name}`);
      }
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to delete post. Please try again.",
      });
    },
  });

  return mutation;
}
