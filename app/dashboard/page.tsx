"use client";

import {
  CheckCircle2,
  CircleAlert,
  Flame,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";

type TopicProgress = {
  topic: {
    _id: string;
    name: string;
    dailyTarget: number;
  };

  progress: {
    _id: string;
    date: string;
    target: number;
    completed: number;
    remaining: number;
  };
};

type DailyProgressResponse = {
  date: string;

  summary: {
    totalTarget: number;
    totalCompleted: number;
    totalRemaining: number;
  };

  progress: TopicProgress[];
};

export default function DashboardPage() {
  const [data, setData] =
    useState<DailyProgressResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get<DailyProgressResponse>(
        "/daily-progress/today"
      );

      // console.log("DASHBOARD DATA:", response.data);

      setData(response.data);
    } catch (error) {
      console.error(
        "Failed to fetch dashboard:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-[var(--muted)]">
          Loading today's progress...
        </p>
      </div>
    );
  }

  const totalTarget = data?.summary.totalTarget ?? 0;
  const totalCompleted = data?.summary.totalCompleted ?? 0;
  const remaining = data?.summary.totalRemaining ?? 0;

  const percentage =
    totalTarget > 0
      ? Math.round(
          (totalCompleted / totalTarget) * 100
        )
      : 0;

  return (
    <div className="space-y-8">

{/* Greeting */}
<section className="pt-2">
  <p className="text-sm font-medium text-[var(--primary)]">
    Today's progress
  </p>

  <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
    Learn a little. Improve a lot.
  </h2>

  <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--muted)]">
    Stay consistent with your daily Q&A targets.
    Every question you complete brings you one step closer to your goal.
  </p>
</section>



      {/* Main progress */}
      <section className="overflow-hidden rounded-3xl bg-[var(--primary)] p-6 text-white shadow-sm sm:p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

          <div>
            <div className="flex items-center gap-2 text-sm text-white/75">
              <Flame size={17} />
              Today's progress
            </div>

            <h3 className="mt-3 text-4xl font-bold">
              {totalCompleted}

              <span className="text-xl font-normal text-white/60">
                {" "}
                / {totalTarget} Q&A
              </span>
            </h3>

            <p className="mt-2 text-sm text-white/75">
              {remaining === 0
                ? "Amazing. You completed everything!"
                : `${remaining} Q&A remaining for today.`}
            </p>
          </div>

          {/* Progress Circle */}
          <div className="relative flex h-32 w-32 shrink-0 items-center justify-center self-center rounded-full border-8 border-white/15">

            <div
              className="absolute inset-0 rounded-full border-8 border-white border-l-transparent border-b-transparent"
              style={{
                transform: `rotate(${percentage * 1.8 - 45}deg)`,
              }}
            />

            <div className="text-center">
              <p className="text-3xl font-bold">
                {percentage}%
              </p>

              <p className="text-xs text-white/60">
                completed
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-3">

        <StatCard
          label="Today's target"
          value={`${totalTarget}`}
          suffix="Q&A"
        />

        <StatCard
          label="Completed"
          value={`${totalCompleted}`}
          suffix="Q&A"
        />

        <StatCard
          label="Remaining"
          value={`${remaining}`}
          suffix="Q&A"
        />

      </section>

      {/* Topics */}
      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Today's topics
            </h3>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Stay focused on what you planned today.
            </p>
          </div>

          <Link
            href="/topics"
            className="hidden items-center gap-1 text-sm font-medium text-[var(--primary)] transition hover:gap-2 sm:flex"
          >
            View topics
            <ArrowRight size={16} />
          </Link>

        </div>

        {!data || data.progress.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white p-8 text-center">

            <p className="font-medium text-gray-900">
              No topics yet
            </p>

            <p className="mt-1 text-sm text-[var(--muted)]">
              Create your first topic to start tracking your progress.
            </p>

            <Link
              href="/topics"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white"
            >
              Create topic
              <ArrowRight size={16} />
            </Link>

          </div>
        ) : (
          <div className="space-y-3">

            {data.progress.map((item) => {
              const topic = item.topic;
              const progressData = item.progress;

              const progress =
                progressData.target > 0
                  ? Math.round(
                      (progressData.completed /
                        progressData.target) *
                        100
                    )
                  : 0;

              const completed =
                progressData.completed >=
                progressData.target;

              return (
                <div
                  key={topic._id}
                  className="rounded-2xl border border-[var(--border)] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >

                  <div className="flex items-center gap-4">

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

                    <div className="min-w-0 flex-1">

                      <div className="flex items-center justify-between gap-3">

                        <h4 className="truncate text-sm font-semibold text-gray-900">
                          {topic.name}
                        </h4>

                        <span className="shrink-0 text-sm font-semibold text-gray-700">
                          {progressData.completed}/
                          {progressData.target}
                        </span>

                      </div>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">

                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            completed
                              ? "bg-[var(--primary)]"
                              : "bg-orange-400"
                          }`}
                          style={{
                            width: `${Math.min(
                              progress,
                              100
                            )}%`,
                          }}
                        />

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </section>

      {/* Remaining */}
      {remaining > 0 &&
        data &&
        data.progress.length > 0 && (
          <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

            <div className="flex gap-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-500 shadow-sm">
                <CircleAlert size={20} />
              </div>

              <div>
                <h3 className="font-semibold text-gray-900">
                  You still have {remaining} Q&A to complete.
                </h3>

                <p className="mt-1 text-sm leading-6 text-gray-600">
                  Don't worry about the full list. Pick the next
                  question and start there.
                </p>
              </div>

            </div>

          </section>
        )}

    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">

      <p className="text-sm text-[var(--muted)]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-gray-900">
        {value}{" "}
        <span className="text-sm font-medium text-gray-400">
          {suffix}
        </span>
      </p>

    </div>
  );
}