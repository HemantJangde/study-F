"use client";

import { Menu, Bell, Search } from "lucide-react";

type NavbarProps = {
  onMenuClick: () => void;
};

export default function Navbar({ onMenuClick }: NavbarProps) {
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
};
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[var(--border)] bg-white/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-xl p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-[var(--border)] bg-gray-50 px-3 py-2 sm:flex">
          <Search size={17} className="text-gray-400" />

          <input
            type="text"
            placeholder="Search your Q&A..."
            className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button className="relative rounded-xl p-2 text-gray-500 transition hover:bg-gray-100">
          <Bell size={20} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--primary)]" />
        </button>

        <div className="flex items-center gap-3 border-l border-[var(--border)] pl-3 sm:pl-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">Student</p>
            <p className="text-xs text-[var(--muted)]">Keep learning</p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
            S
          </div>
          <button onClick={handleLogout}>
  Logout
</button> 
        </div>
      </div>
    </header>
  );
}