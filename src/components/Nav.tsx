"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/samples", label: "Samples" },
  { href: "/aliquots", label: "Aliquots" },
  { href: "/experiments", label: "Experiments" },
  { href: "/batches", label: "Batches" },
  { href: "/storage", label: "Storage" },
  { href: "/import-export", label: "Imports / Exports" },
  { href: "/alerts", label: "Alerts" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-4">
        <Link href="/samples" className="text-lg font-semibold text-gray-900">
          Aliquot First-Class
        </Link>
        {nav.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`text-sm font-medium ${
              pathname.startsWith(href) ? "text-blue-600" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3">
        <form action="/search" method="GET" className="flex">
          <input
            type="search"
            name="q"
            placeholder="Search aliquot ID, sample, batch…"
            className="w-64 rounded-l border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="rounded-r border border-l-0 border-gray-300 bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Search
          </button>
        </form>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
