import Link, { LinkProps } from "next/link";
import UserTooltip from "./UserTooltip";
import { UserData } from "@/types/post";

interface LinkToolTipOptionProps extends LinkProps {
  tooltip?: boolean;
  user?: UserData | null;
  className?: string;
  children: React.ReactNode;
}

export default function LinkWithToolTipOption({
  children,
  tooltip = true,
  user = null,
  ...props
}: LinkToolTipOptionProps) {
  return tooltip && user ? (
    <UserTooltip user={user}>
      <Link {...props}>{children}</Link>
    </UserTooltip>
  ) : (
    <Link {...props}>{children}</Link>
  );
}
