
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquareText,
  History,
  Target,
  Settings,
  X,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Topics",
    href: "/topics",
    icon: BookOpen,
  },
  {
    name: "Q&A",
    href: "/qa",
    icon: MessageSquareText,
  },
  {
    name: "Notes",
    href: "/notes",
    icon: BookOpen,
  },
  {
    name: "History",
    href: "/history",
    icon: History,
  },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 lg:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-[var(--border)] bg-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-[var(--border)] px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--primary)] text-white">
              <Target size={19} />
            </div>

            <div>
              <h1 className="font-semibold tracking-tight">
                StudyTrack
              </h1>

              <p className="text-xs text-[var(--muted)]">
                Keep learning.
              </p>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-6">
          <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-[var(--primary-light)] text-[var(--primary)]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  size={19}
                  className="transition-transform duration-200 group-hover:scale-105"
                />

                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-[var(--border)] p-3">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
          >
            <Settings size={19} />
            Settings
          </Link>

          <div className="mt-3 rounded-xl bg-[var(--primary-light)] p-4">
            <p className="text-sm font-semibold text-[var(--primary)]">
              Keep going.
            </p>

            <p className="mt-1 text-xs leading-5 text-gray-600">
              Small progress every day becomes something big.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}


