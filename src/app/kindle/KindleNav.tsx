"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/kindle", label: "Dashboard" },
  { href: "/kindle/todo", label: "Todo" },
  { href: "/kindle/next", label: "Next" },
];

export function KindleNav() {
  const pathname = usePathname();

  return (
    <nav className="kindle-nav mt-4">
      {links.map((link) => {
        const isActive =
          link.href === "/kindle" ? pathname === "/kindle" : pathname.startsWith(link.href);

        return (
          <Link
            className={`kindle-nav-link ${isActive ? "kindle-nav-link-active" : ""}`}
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
