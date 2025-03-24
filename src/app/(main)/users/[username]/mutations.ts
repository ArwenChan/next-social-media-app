import { PostsPage } from "@/types/post";
import { UpdateUserProfileValues } from "@/lib/validation";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserProfile } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useUploadThing } from "@/lib/uploadthing";
import { UploadThingError } from "uploadthing/server";
import { useState } from "react";

export function useUpdateProfileMutation() {
  const { toast } = useToast();

  const router = useRouter();

  const queryClient = useQueryClient();

  const [uploadError, setUploadError] = useState<UploadThingError | null>(null);
  const { startUpload: startAvatarUpload } = useUploadThing("imageUploader", {
    onUploadError: (e) => {
      setUploadError(e as UploadThingError);
    },
  });

  const mutation = useMutation({
    mutationFn: async ({
      values,
      avatar,
    }: {
      values: UpdateUserProfileValues;
      avatar?: File;
    }) => {
      return Promise.all([
        updateUserProfile(values),
        avatar && startAvatarUpload([avatar]),
      ]);
    },
    onSuccess: async ([updatedUser, uploadResult]) => {
      if (uploadError) {
        toast({
          variant: "destructive",
          description: uploadError.message,
        });
        return;
      }
      const newAvatarUrl = uploadResult?.[0].serverData.avatarUrl;

      const queryFilter = {
        queryKey: ["post-feed"],
      } satisfies QueryFilters<InfiniteData<PostsPage, string | null>>;

      await queryClient.cancelQueries(queryFilter);

      queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          if (!oldData) return;

          return {
            pageParams: oldData.pageParams,
            pages: oldData.pages.map((page) => ({
              nextCursor: page.nextCursor,
              posts: page.posts.map((post) => {
                if (post.user.id === updatedUser.id) {
                  return {
                    ...post,
                    user: {
                      ...updatedUser,
                      image: newAvatarUrl || updatedUser.image,
                    },
                  };
                }
                return post;
              }),
            })),
          };
        },
      );

      //update server component part
      router.refresh();

      toast({
        description: "Profile updated",
      });
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to update profile. Please try again.",
      });
    },
  });

  return mutation;
}
