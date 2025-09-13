"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/cohorts", label: "Cohorts" },
    { href: "/residents", label: "Residents" },
    { href: "/resources", label: "Resources" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">UBZ</span>
              <span className="ml-2 text-lg font-medium text-gray-700">
                Urban Blue Zone
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === item.href
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </button>
            <div className="flex items-center space-x-3">
              {session ? (
                <>
                  <span className="text-sm text-gray-700">
                    {session.user?.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-500">Development Mode</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}