"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, PlusIcon, SearchIcon, UserIcon } from "./Icons";

export function BottomNav({ username }: { username: string | null }) {
  const path = usePathname();
  const profileHref = username ? `/u/${username}` : "/giris?next=/";
  const items = [
    { href: "/", label: "Akış", Icon: HomeIcon, active: path === "/" },
    { href: "/ara", label: "Ara", Icon: SearchIcon, active: path.startsWith("/ara") },
    { href: username ? "/yeni" : "/giris?next=/yeni", label: "Yükle", Icon: PlusIcon, active: path === "/yeni", accent: true },
    { href: profileHref, label: "Profil", Icon: UserIcon, active: path.startsWith("/u/") || path.startsWith("/ayarlar") },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, Icon, active, accent }) => (
          <li key={label} className="flex-1">
            <Link
              href={href}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] ${active ? "text-ink" : "text-muted"}`}
            >
              {accent ? (
                <span className="flex h-7 w-11 items-center justify-center rounded-full bg-terracotta text-cream">
                  <Icon className="h-5 w-5" />
                </span>
              ) : (
                <Icon className="h-6 w-6" />
              )}
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
