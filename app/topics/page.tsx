"use client";

import { motion } from "framer-motion";
import {
  Plus,
  MoreHorizontal,
  CheckCircle2,
  CircleAlert,
  BookOpen,
} from "lucide-react";
import { useEffect, useState } from "react";
import CreateTopicModal from "../components/CreateTopicModal";
import api from "../../lib/api";

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

export default function TopicsPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const [data, setData] = useState<DailyProgressResponse | null>(null);

  const [loading, setLoading] = useState(true);

  // Temporary user ID
  // Later this will come from authentication.


  const fetchTodayProgress = async () => {
    try {
      setLoading(true);

      const response = await api.get<DailyProgressResponse>(
  "/daily-progress/today"
);

      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch today's progress:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodayProgress();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);

    return new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <section className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[var(--primary)]">
              Your learning
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
              Topics
            </h1>

            {data && (
              <p className="mt-2 text-sm text-gray-500">
                {formatDate(data.date)}
              </p>
            )}

            <p className="mt-1 text-sm text-gray-500">
              Track today's Q&A progress for every topic.
            </p>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-900/10"
          >
            <Plus size={18} />
            Create topic
          </button>
        </section>

        {/* Date indicator */}
        {data && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-white px-5 py-4"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Today's report
              </p>

              <p className="mt-1 font-semibold text-gray-900">
                {formatDate(data.date)}
              </p>
            </div>

            <div className="rounded-xl bg-[var(--primary-light)] px-3 py-2 text-sm font-semibold text-[var(--primary)]">
              {data.summary.totalCompleted} /{" "}
              {data.summary.totalTarget} Q&A
            </div>
          </motion.div>
        )}

        {/* Summary */}
        {data && (
          <section className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Today's target"
              value={`${data.summary.totalTarget} Q&A`}
              icon={<BookOpen size={19} />}
            />

            <SummaryCard
              label="Completed"
              value={`${data.summary.totalCompleted} Q&A`}
              icon={<CheckCircle2 size={19} />}
            />

            <SummaryCard
              label="Remaining"
              value={`${data.summary.totalRemaining} Q&A`}
              icon={<CircleAlert size={19} />}
            />
          </section>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-48 animate-pulse rounded-2xl bg-gray-200/60"
              />
            ))}
          </div>
        )}

        {/* Topics */}
        {!loading && data && (
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Your topics
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Your progress for today's date.
              </p>
            </div>

            {data.progress.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <BookOpen
                  size={28}
                  className="mx-auto text-gray-300"
                />

                <h3 className="mt-4 font-semibold text-gray-800">
                  No topics yet
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Create your first topic and start tracking your learning.
                </p>

                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-5 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Create your first topic
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {data.progress.map((item, index) => {
                  const { topic, progress } = item;

                  const percentage =
                    progress.target > 0
                      ? Math.round(
                          (progress.completed / progress.target) * 100
                        )
                      : 0;

                  const completed =
                    progress.completed >= progress.target;

                  return (
                    <motion.div
                      key={topic._id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                      className="group rounded-2xl border border-[var(--border)] bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-900/5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              completed
                                ? "bg-[var(--primary-light)] text-[var(--primary)]"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {completed ? (
                              <CheckCircle2 size={21} />
                            ) : (
                              <BookOpen size={21} />
                            )}
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {topic.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {topic.dailyTarget} Q&A every day
                            </p>
                          </div>
                        </div>

                        <button className="rounded-lg p-2 text-gray-400 opacity-0 transition group-hover:opacity-100 hover:bg-gray-100 hover:text-gray-700">
                          <MoreHorizontal size={19} />
                        </button>
                      </div>

                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            Today's progress
                          </span>

                          <span className="font-semibold text-gray-700">
                            {progress.completed}/{progress.target}
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                            transition={{ duration: 0.7 }}
                            className={`h-full rounded-full ${
                              completed
                                ? "bg-[var(--primary)]"
                                : "bg-orange-400"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        {completed ? (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--primary)]">
                            <CheckCircle2 size={15} />
                            Target completed
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
                            <CircleAlert size={15} />
                            {progress.remaining} remaining
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <CreateTopicModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          fetchTodayProgress();
        }}
      />
    </>
  );
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-1 font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}