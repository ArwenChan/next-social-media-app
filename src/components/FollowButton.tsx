"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import { useToast } from "@/hooks/use-toast";
import { FollowerInfo } from "@/types/post";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}

export default function FollowButton({
  userId,
  initialState,
}: FollowButtonProps) {
  const { toast } = useToast();

  const queryClient = useQueryClient();

  const { data } = useFollowerInfo(userId, initialState);

  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${userId}/followers`, {
        method: data.isFollowedByUser ? "DELETE" : "POST",
      });
      if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
    },
    onMutate: async () => {
      // this is a optimistic update
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));
      // here return previous state so it can be used in onError for rolling back.
      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
