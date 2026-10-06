"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      router.push("/dashboard");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-[#e5e8e3] rounded-2xl p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#171a17]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-[#6b716b]">
            Login to continue your study journey.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-sm font-medium">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-2 w-full rounded-xl border border-[#e5e8e3] px-4 py-3 outline-none focus:border-[#1f7a4d]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-2 w-full rounded-xl border border-[#e5e8e3] px-4 py-3 outline-none focus:border-[#1f7a4d]"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1f7a4d] py-3 font-medium text-white transition hover:bg-[#17633d] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b716b]">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-[#1f7a4d]"
          >
            Create account
          </a>
        </p>
      </div>
    </div>
  );
}