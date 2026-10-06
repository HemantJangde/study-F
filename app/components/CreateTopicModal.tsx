"use client";

import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import api from "@/lib/api";

type CreateTopicModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function CreateTopicModal({
  open,
  onClose,
}: CreateTopicModalProps) {
  const [name, setName] = useState("");
  const [dailyTarget, setDailyTarget] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter a topic name.");
      return;
    }

    const target = Number(dailyTarget);

    if (!target || target < 1) {
      setError("Daily target must be at least 1.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/topics", {
        name: name.trim(),
        dailyTarget: target,
      });

      // Reset form
      setName("");
      setDailyTarget("5");

      onClose();
    } catch (error: any) {
      // console.error("Create topic error:", error);

      setError(
        error?.response?.data?.message ||
          "Failed to create topic. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Create topic
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Set what you want to study every day.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">

          {/* Topic name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Topic name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Java Arrays"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              disabled={loading}
            />
          </div>

          {/* Daily target */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Daily Q&A target
            </label>

            <input
              type="number"
              min="1"
              value={dailyTarget}
              onChange={(e) => setDailyTarget(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/10"
              disabled={loading}
            />

            <p className="mt-2 text-xs text-gray-400">
              Example: 5 means you should complete 5 Q&A every day.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create topic"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}