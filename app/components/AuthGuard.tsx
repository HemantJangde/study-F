"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    setIsAuthenticated(true);
    setChecking(false);
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#f7f8f5] flex items-center justify-center">
        <p className="text-sm text-[#6b716b]">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}