
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  ChevronUp,
  BookOpen,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

type Topic = {
  _id: string;
  name: string;
};

type Question = {
  _id: string;
  topic: Topic;
  question: string;
  answer: string;
  completedDates?: string[];
  createdAt: string;
};

export default function NotesPage() {
  const [questions, setQuestions] = useState<Question[]>(
    []
  );

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [selectedTopic, setSelectedTopic] =
    useState("all");

  const [openQuestions, setOpenQuestions] =
    useState<Set<string>>(new Set());

  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);

      const response = await api.get("/questions");

    //   console.log("Notes API:", response.data);

      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error(
        "Failed to fetch questions:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Get unique topics
   */

  const topics = useMemo(() => {
    const topicMap = new Map<string, Topic>();

    questions.forEach((item) => {
      if (item.topic) {
        topicMap.set(
          item.topic._id,
          item.topic
        );
      }
    });

    return Array.from(topicMap.values());
  }, [questions]);

  /*
   * Filter questions
   */

  const filteredQuestions = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return questions.filter((item) => {
      const matchesTopic =
        selectedTopic === "all" ||
        item.topic?._id === selectedTopic;

      const matchesSearch =
        !searchText ||
        item.question
          .toLowerCase()
          .includes(searchText) ||
        item.answer
          .toLowerCase()
          .includes(searchText) ||
        item.topic?.name
          .toLowerCase()
          .includes(searchText);

      return matchesTopic && matchesSearch;
    });
  }, [
    questions,
    selectedTopic,
    search,
  ]);

  /*
   * Open / close question
   */

  const toggleQuestion = (id: string) => {
    setOpenQuestions((previous) => {
      const next = new Set(previous);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  /*
   * Show / hide all
   */

  const toggleAll = () => {
    if (showAll) {
      setOpenQuestions(new Set());
      setShowAll(false);
      return;
    }

    setOpenQuestions(
      new Set(
        filteredQuestions.map(
          (item) => item._id
        )
      )
    );

    setShowAll(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}

      <section>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
            <BookOpen size={22} />
          </div>

          <div>
            <p className="text-sm font-medium text-[var(--primary)]">
              Revision notes
            </p>

            <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Your Q&A Notes
            </h1>
          </div>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-[var(--muted)]">
          All your questions and answers in one place.
          Choose a topic and revise whenever you need.
        </p>
      </section>

      {/* Filters */}

      <section className="sticky top-4 z-10 rounded-2xl border border-[var(--border)] bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Search */}

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search your notes..."
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-[var(--primary)]"
            />
          </div>

          {/* Topic filter */}

          <select
            value={selectedTopic}
            onChange={(event) =>
              setSelectedTopic(event.target.value)
            }
            className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-[var(--primary)]"
          >
            <option value="all">
              All Topics
            </option>

            {topics.map((topic) => (
              <option
                key={topic._id}
                value={topic._id}
              >
                {topic.name}
              </option>
            ))}
          </select>

          {/* Show all */}

          <button
            type="button"
            onClick={toggleAll}
            disabled={filteredQuestions.length === 0}
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {showAll ? (
              <ChevronUp size={17} />
            ) : (
              <ChevronDown size={17} />
            )}

            {showAll
              ? "Hide all"
              : "Show all"}
          </button>
        </div>

        {/* Result count */}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-[var(--muted)]">
            {filteredQuestions.length}{" "}
            {filteredQuestions.length === 1
              ? "note"
              : "notes"}
          </p>

          {(search ||
            selectedTopic !== "all") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedTopic("all");
              }}
              className="text-xs font-medium text-[var(--primary)]"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* Loading */}

      {loading && (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
          <p className="text-sm text-[var(--muted)]">
            Loading your notes...
          </p>
        </div>
      )}

      {/* Empty */}

      {!loading &&
        questions.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
            <BookOpen
              size={32}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No notes yet
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Create some Q&A first and they will
              appear here for revision.
            </p>
          </div>
        )}

      {/* No search results */}

      {!loading &&
        questions.length > 0 &&
        filteredQuestions.length === 0 && (
          <div className="rounded-2xl border border-[var(--border)] bg-white p-10 text-center">
            <Search
              size={32}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No notes found
            </h2>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Try another search or choose a different
              topic.
            </p>
          </div>
        )}

      {/* Notes */}

      {!loading &&
        filteredQuestions.length > 0 && (
          <section className="space-y-4">
            {filteredQuestions.map(
              (item, index) => {
                const isOpen =
                  openQuestions.has(item._id);

                return (
                  <motion.article
                    key={item._id}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(
                        index * 0.03,
                        0.3
                      ),
                    }}
                    className="overflow-hidden rounded-2xl border border-[var(--border)] bg-white"
                  >
                    {/* Question header */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleQuestion(
                          item._id
                        )
                      }
                      className="w-full p-5 text-left transition hover:bg-gray-50 sm:p-6"
                    >
                      <div className="flex gap-4">
                        {/* Number */}

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-500">
                          {index + 1}
                        </div>

                        {/* Question */}

                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-[var(--primary-light)] px-2.5 py-1 text-[11px] font-medium text-[var(--primary)]">
                              {item.topic?.name ||
                                "Unknown topic"}
                            </span>

                            {item.completedDates &&
                              item.completedDates
                                .length > 0 && (
                                <span className="flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-medium text-green-600">
                                  <CheckCircle2
                                    size={12}
                                  />
                                  Practiced
                                </span>
                              )}
                          </div>

                          <h2 className="text-base font-semibold leading-7 text-gray-900 sm:text-lg">
                            {item.question}
                          </h2>
                        </div>

                        {/* Arrow */}

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400">
                          {isOpen ? (
                            <ChevronUp size={19} />
                          ) : (
                            <ChevronDown size={19} />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Answer */}

                    {isOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                        }}
                        className="border-t border-[var(--border)]"
                      >
                        <div className="bg-[#fafbf9] px-5 py-6 sm:px-6">
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--primary)]">
                            Answer
                          </p>

                          <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                            {item.answer}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.article>
                );
              }
            )}
          </section>
        )}
    </div>
  );
}

