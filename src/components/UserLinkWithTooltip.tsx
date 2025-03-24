"use client";

import { UserData } from "@/types/post";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PropsWithChildren } from "react";
import UserTooltip from "./UserTooltip";

interface UserLinkWithTooltipProps extends PropsWithChildren {
  username: string;
}

export default function UserLinkWithTooltip({
  children,
  username,
}: UserLinkWithTooltipProps) {
  const { data } = useQuery<UserData>({
    queryKey: ["user-data", username],
    queryFn: async () => {
      const response = await fetch(`/api/users/username/${username}`);
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.status.toString(), {
        cause: response.statusText,
      });
    },
    retry(failureCount, error) {
      if (error.message === "404") {
        return false;
      }
      return failureCount < 3;
    },
    staleTime: Infinity,
  });

  // the initial state
  if (!data) {
    return (
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <UserTooltip user={data}>
      <Link
        href={`/users/${username}`}
        className="text-primary hover:underline"
      >
        {children}
      </Link>
    </UserTooltip>
  );
}
