import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";
import Navbar from "./Navbar";
import MenuBar from "./MenuBar";
import TrendsSidebar from "@/components/TrendsSidebar";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 sm:block" />
          <main className="flex w-full min-w-0 gap-5">
            {children}
            <TrendsSidebar className="sticky top-[5.25rem] hidden h-fit w-72 flex-none md:block lg:w-80" />
          </main>
        </div>
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t sm:hidden" />
      </div>
    </SessionProvider>
  );
}
