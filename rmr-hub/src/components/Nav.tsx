"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "@/components/icons";

const items: { href: string; label: string; icon: IconName; mobile: boolean }[] = [
  { href: "/", label: "Home", icon: "home", mobile: true },
  { href: "/hours", label: "Hours", icon: "clock", mobile: true },
  { href: "/invoices", label: "Invoices", icon: "invoice", mobile: true },
  { href: "/money", label: "Money", icon: "money", mobile: true },
  { href: "/tax", label: "Tax", icon: "tax", mobile: true },
  { href: "/clients", label: "Clients", icon: "users", mobile: false },
  { href: "/contracts", label: "Contracts", icon: "pen", mobile: false },
  { href: "/settings", label: "Settings", icon: "settings", mobile: false },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function SideNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-1">
      {items.map((i) => {
        const active = isActive(pathname, i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold ${
              active ? "bg-pale text-blue" : "text-grey hover:bg-ground hover:text-navy"
            }`}
          >
            <Icon name={i.icon} />
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="grid grid-cols-5">
        {items
          .filter((i) => i.mobile)
          .map((i) => {
            const active = isActive(pathname, i.href);
            return (
              <li key={i.href}>
                <Link
                  href={i.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-bold ${
                    active ? "text-blue" : "text-grey"
                  }`}
                >
                  <Icon name={i.icon} size={22} />
                  {i.label}
                </Link>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
