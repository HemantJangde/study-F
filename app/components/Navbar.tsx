
"use client";

import { useEffect, useState } from "react";
import {
  Menu,
  Bell,
  LogOut,
} from "lucide-react";

type NavbarProps = {
  onMenuClick: () => void;
};

type UserData = {
  name?: string;
  email?: string;
};

export default function Navbar({
  onMenuClick,
}: NavbarProps) {
  const [user, setUser] = useState<UserData | null>(
    null
  );

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  const userName = user?.name || "User";

  const firstLetter = userName
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[var(--border)] bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification */}
        <button
          type="button"
          className="relative rounded-xl p-2.5 text-gray-500 transition hover:bg-gray-100"
          aria-label="Notifications"
        >
          <Bell size={20} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
        </button>

        {/* Divider */}
        <div className="h-8 w-px bg-[var(--border)]" />

        {/* User */}
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
            {firstLetter}
          </div>

          {/* User Info */}
          <div className="hidden sm:block">
            <p className="max-w-32 truncate text-sm font-semibold text-gray-900">
              {userName}
            </p>

            <p className="max-w-40 truncate text-xs text-[var(--muted)]">
              {user?.email || "Keep learning"}
            </p>
          </div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={17} />

            <span className="hidden md:inline">
              Logout
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

