
"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

type ProgressItem = {
  progress: {
    _id: string;
    date: string;
    target: number;
    completed: number;
    remaining: number;
  };

  topic: {
    _id: string;
    name: string;
    dailyTarget: number;
  };
};

type HistoryResponse = {
  date: string;
  progress: ProgressItem[];
};

function getTodayDate() {
  const now = new Date();

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function changeDate(
  currentDate: string,
  amount: number
) {
  const date = new Date(`${currentDate}T00:00:00`);

  date.setDate(date.getDate() + amount);

  return date.toISOString().split("T")[0];
}

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(
    getTodayDate()
  );

  const [data, setData] =
    useState<HistoryResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const today = getTodayDate();

  useEffect(() => {
    fetchHistory(selectedDate);
  }, [selectedDate]);

  const fetchHistory = async (date: string) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/daily-progress?date=${date}`
      );

    //   console.log("History API:", response.data);

      setData(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch history:",
        error
      );

      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    setSelectedDate(
      changeDate(selectedDate, -1)
    );
  };

  const handleNextDay = () => {
    const nextDate = changeDate(
      selectedDate,
      1
    );

    if (nextDate <= today) {
      setSelectedDate(nextDate);
    }
  };

  const isToday = selectedDate === today;

  /*
   * Calculate summary from API progress
   */

  const totalTarget =
    data?.progress.reduce(
      (total, item) =>
        total + item.progress.target,
      0
    ) || 0;

  const totalCompleted =
    data?.progress.reduce(
      (total, item) =>
        total + item.progress.completed,
      0
    ) || 0;

  const totalRemaining =
    data?.progress.reduce(
      (total, item) =>
        total + item.progress.remaining,
      0
    ) || 0;

  const percentage =
    totalTarget > 0
      ? Math.round(
          (totalCompleted / totalTarget) * 100
        )
      : 0;

  return (
    <div className="space-y-8">
      {/* Header */}

      <section>
        <p className="text-sm font-medium text-[var(--primary)]">
          Your learning history
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          See how you have been doing.
        </h1>

        <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
          Review your daily Q&A progress and see how
          consistently you are studying.
        </p>
      </section>

      {/* Date selector */}

      <section className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handlePreviousDay}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            <ArrowLeft size={17} />
            Previous
          </button>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-[var(--primary)]">
              <CalendarDays size={18} />

              <span className="text-xs font-medium uppercase tracking-wide">
                Selected date
              </span>
            </div>

            <p className="mt-1 text-sm font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextDay}
            disabled={isToday}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Date input */}

        <div className="mt-4 flex justify-center">
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(event) =>
              setSelectedDate(event.target.value)
            }
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-gray-700 outline-none transition focus:border-[var(--primary)]"
          />
        </div>
      </section>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading history...
          </p>
        </div>
      )}

      {/* History */}

      {!loading && data && (
        <>
          {/* Statistics */}

          <section className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Daily target"
              value={totalTarget}
            />

            <StatCard
              label="Completed"
              value={totalCompleted}
            />

            <StatCard
              label="Remaining"
              value={totalRemaining}
            />
          </section>

          {/* Overall progress */}

          <section className="rounded-3xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/70">
                  {isToday
                    ? "Today's progress"
                    : "Daily progress"}
                </p>

                <h2 className="mt-2 text-3xl font-bold">
                  {totalCompleted}

                  <span className="text-lg font-normal text-white/60">
                    {" "}
                    / {totalTarget} Q&A
                  </span>
                </h2>

                <p className="mt-2 text-sm text-white/70">
                  {totalRemaining === 0 &&
                  totalTarget > 0
                    ? "Target completed 🎉"
                    : `${totalRemaining} Q&A remaining`}
                </p>
              </div>

              <div className="flex h-24 w-24 shrink-0 items-center justify-center self-center rounded-full border-8 border-white/15">
                <p className="text-2xl font-bold">
                  {percentage}%
                </p>
              </div>
            </div>
          </section>

          {/* Topics */}

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Topic progress
              </h2>

              <p className="mt-1 text-sm text-[var(--muted)]">
                Your progress for{" "}
                {formatDate(selectedDate)}.
              </p>
            </div>

            {data.progress.length === 0 ? (
              <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center">
                <p className="text-sm text-[var(--muted)]">
                  No study progress recorded for this
                  date.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.progress.map((item) => {
                  const completed =
                    item.progress.completed >=
                    item.progress.target;

                  const itemPercentage =
                    item.progress.target > 0
                      ? Math.round(
                          (item.progress.completed /
                            item.progress.target) *
                            100
                        )
                      : 0;

                  return (
                    <motion.div
                      key={item.progress._id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="rounded-2xl border border-[var(--border)] bg-white p-5"
                    >
                      <div className="flex items-center gap-4">
                        {/* Status icon */}

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            completed
                              ? "bg-[var(--primary-light)] text-[var(--primary)]"
                              : "bg-orange-50 text-orange-500"
                          }`}
                        >
                          {completed ? (
                            <CheckCircle2 size={21} />
                          ) : (
                            <CircleAlert size={21} />
                          )}
                        </div>

                        {/* Topic content */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="truncate text-sm font-semibold text-gray-900">
                              {item.topic.name}
                            </h3>

                            <span className="shrink-0 text-sm font-semibold text-gray-700">
                              {item.progress.completed}/
                              {item.progress.target}
                            </span>
                          </div>

                          {/* Progress bar */}

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                completed
                                  ? "bg-[var(--primary)]"
                                  : "bg-orange-400"
                              }`}
                              style={{
                                width: `${Math.min(
                                  itemPercentage,
                                  100
                                )}%`,
                              }}
                            />
                          </div>

                          {/* Status */}

                          <p className="mt-2 text-xs text-[var(--muted)]">
                            {completed
                              ? "Target completed"
                              : `${item.progress.remaining} Q&A remaining`}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {/* Error */}

      {!loading && !data && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm text-red-600">
            Unable to load history for this date.
          </p>

          <button
            type="button"
            onClick={() =>
              fetchHistory(selectedDate)
            }
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}
        <span className="ml-1 text-sm font-medium text-gray-400">
          Q&A
        </span>
      </p>
    </div>
  );
}

