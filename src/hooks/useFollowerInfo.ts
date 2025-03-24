import { FollowerInfo } from "@/types/post";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initialState: FollowerInfo,
) {
  const query = useQuery<FollowerInfo>({
    queryKey: ["follower-info", userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/followers`);
      if (!response.ok) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
      return response.json();
    },
    initialData: initialState,
    staleTime: Infinity,
  });

  return query;
}
