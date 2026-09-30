import Link from "next/link";
import { logOut } from "@/app/actions";
import { Blocks, Icon } from "@/components/icons";
import { SideNav, TabBar } from "@/components/Nav";

export const dynamic = "force-dynamic";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-white p-4 md:flex">
        <Link href="/" className="mb-6 flex items-center gap-2 px-2">
          <Blocks size={30} />
          <span className="font-display text-lg font-extrabold">
            RMR <span className="text-blue">Hub</span>
          </span>
        </Link>
        <SideNav />
        <form action={logOut} className="mt-auto">
          <button className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-bold text-grey hover:bg-ground">
            <Icon name="logout" /> Sign out
          </button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <Blocks size={26} />
            <span className="font-display text-lg font-extrabold">
              RMR <span className="text-blue">Hub</span>
            </span>
          </Link>
          <div className="flex items-center gap-1">
            <Link href="/contracts" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-grey" aria-label="Contracts">
              <Icon name="pen" size={22} />
            </Link>
            <Link href="/clients" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-grey" aria-label="Clients">
              <Icon name="users" size={22} />
            </Link>
            <Link href="/settings" className="flex min-h-11 min-w-11 items-center justify-center rounded-xl text-grey" aria-label="Settings">
              <Icon name="settings" size={22} />
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 pt-5 pb-28 sm:px-6 md:pt-8 md:pb-12">{children}</main>
      </div>
      <TabBar />
    </div>
  );
}
