"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ChevronDown,
  X,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Topic {
  _id: string;
  name: string;
  dailyTarget: number;
}

type Question = {
  _id: string;

  topic: {
    _id: string;
    name: string;
  };

  question: string;
  answer: string;

  completedDates?: string[];

  createdAt: string;
};

export default function QAPage() {
  // --------------------------------
  // Date
  // --------------------------------

  const getTodayDate = () => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  };

  // --------------------------------
  // State
  // --------------------------------

  const [questions, setQuestions] = useState<Question[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  const [search, setSearch] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");

  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Create
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [topicId, setTopicId] = useState("");

  // Edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [editTopicId, setEditTopicId] = useState("");

  // --------------------------------
  // Fetch data
  // --------------------------------

  const fetchData = async () => {
    try {
      setLoading(true);

      const [questionResponse, topicResponse] = await Promise.all([
        api.get("/questions"),
        api.get("/topics"),
      ]);

      const fetchedQuestions =
        questionResponse.data.questions || [];

      const fetchedTopics =
        topicResponse.data.topics || [];

      setQuestions(fetchedQuestions);
      setTopics(fetchedTopics);

      if (fetchedTopics.length > 0 && !topicId) {
        setTopicId(fetchedTopics[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch Q&A data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------
  // Create Q&A
  // --------------------------------

  const handleCreateQuestion = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !topicId ||
      !question.trim() ||
      !answer.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      await api.post("/questions", {
        topicId,
        question: question.trim(),
        answer: answer.trim(),
      });

      setQuestion("");
      setAnswer("");
      setShowForm(false);

      await fetchData();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Failed to create question"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // Complete Q&A
  // --------------------------------

  const handleComplete = async (id: string) => {
    try {
      setCompletingId(id);

      await api.post(`/questions/${id}/complete`);

      await fetchData();
    } catch (error: any) {
      console.error("Complete question error:", error);

      alert(
        error?.response?.data?.message ||
          "Failed to complete question"
      );
    } finally {
      setCompletingId(null);
    }
  };

  // --------------------------------
  // Edit
  // --------------------------------

  const handleEdit = (item: Question) => {
    setEditingId(item._id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
    setEditTopicId(item.topic._id);
  };

  // --------------------------------
  // Cancel edit
  // --------------------------------

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditQuestion("");
    setEditAnswer("");
    setEditTopicId("");
  };

  // --------------------------------
  // Update Q&A
  // --------------------------------

  const handleUpdate = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (
      !editingId ||
      !editTopicId ||
      !editQuestion.trim() ||
      !editAnswer.trim()
    ) {
      return;
    }

    try {
      setSaving(true);

      await api.put(`/questions/${editingId}`, {
        topicId: editTopicId,
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
      });

      handleCancelEdit();

      await fetchData();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Failed to update question"
      );
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------
  // Delete
  // --------------------------------

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Q&A?"
    );

    if (!confirmed) return;

    try {
      await api.delete(`/questions/${id}`);

      setQuestions((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          "Failed to delete question"
      );
    }
  };

  // --------------------------------
  // Search + filter
  // --------------------------------

  const filteredQuestions = questions.filter((item) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      item.question
        .toLowerCase()
        .includes(searchText) ||
      item.answer
        .toLowerCase()
        .includes(searchText);

    const matchesTopic =
      selectedTopic === "all" ||
      item.topic._id === selectedTopic;

    return matchesSearch && matchesTopic;
  });

  // --------------------------------
  // Render
  // --------------------------------

  return (
    <div className="space-y-6">

      {/* Header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#171a17]">
            Questions & Answers
          </h1>

          <p className="mt-1 text-sm text-[#6b716b]">
            Build your own revision library.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#1f7a4d] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#17633d]"
        >
          <Plus size={18} />
          Add Q&A
        </button>
      </div>

      {/* Search + Filter */}

      <div className="flex flex-col gap-3 sm:flex-row">

        {/* Search */}

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a908a]"
          />

          <input
            type="text"
            placeholder="Search questions or answers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#e5e8e3] bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#1f7a4d]"
          />
        </div>

        {/* Topic filter */}

        <div className="relative">
          <select
            value={selectedTopic}
            onChange={(e) =>
              setSelectedTopic(e.target.value)
            }
            className="w-full appearance-none rounded-xl border border-[#e5e8e3] bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#1f7a4d] sm:w-56"
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

          <ChevronDown
            size={17}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#6b716b]"
          />
        </div>
      </div>

      {/* Create form */}

      {showForm && (
        <motion.div
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="rounded-2xl border border-[#e5e8e3] bg-white p-6 shadow-sm"
        >
          <div className="mb-5 flex items-start justify-between gap-4">

            <div>
              <h2 className="text-lg font-semibold text-[#171a17]">
                Add a new Q&A
              </h2>

              <p className="mt-1 text-sm text-[#6b716b]">
                Save something you learned for later revision.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 text-[#6b716b] transition hover:bg-[#f7f8f5]"
            >
              <X size={18} />
            </button>

          </div>

          <form
            onSubmit={handleCreateQuestion}
            className="space-y-5"
          >

            {/* Topic */}

            <div>
              <label className="text-sm font-medium text-[#171a17]">
                Topic
              </label>

              <select
                value={topicId}
                onChange={(e) =>
                  setTopicId(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-[#e5e8e3] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#1f7a4d]"
                required
              >
                <option value="">
                  Select topic
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
            </div>

            {/* Question */}

            <div>
              <label className="text-sm font-medium text-[#171a17]">
                Question
              </label>

              <textarea
                value={question}
                onChange={(e) =>
                  setQuestion(e.target.value)
                }
                placeholder="e.g. What is an array in Java?"
                rows={3}
                className="mt-2 w-full resize-none rounded-xl border border-[#e5e8e3] px-4 py-3 text-sm outline-none transition focus:border-[#1f7a4d]"
                required
              />
            </div>

            {/* Answer */}

            <div>
              <label className="text-sm font-medium text-[#171a17]">
                Answer
              </label>

              <textarea
                value={answer}
                onChange={(e) =>
                  setAnswer(e.target.value)
                }
                placeholder="Write your answer..."
                rows={5}
                className="mt-2 w-full resize-none rounded-xl border border-[#e5e8e3] px-4 py-3 text-sm outline-none transition focus:border-[#1f7a4d]"
                required
              />
            </div>

            {/* Buttons */}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-[#e5e8e3] px-4 py-2.5 text-sm font-medium text-[#555b55] transition hover:bg-[#f7f8f5]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#1f7a4d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#17633d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Q&A"}
              </button>
            </div>

          </form>
        </motion.div>
      )}

      {/* Questions */}

      {loading ? (
        <div className="rounded-2xl border border-[#e5e8e3] bg-white p-10 text-center">
          <p className="text-sm text-[#6b716b]">
            Loading your Q&A...
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d9ddd8] bg-white p-12 text-center">
          <h3 className="font-medium text-[#171a17]">
            {search || selectedTopic !== "all"
              ? "No Q&A found"
              : "No Q&A yet"}
          </h3>

          <p className="mt-1 text-sm text-[#6b716b]">
            {search || selectedTopic !== "all"
              ? "Try changing your search or topic filter."
              : "Start adding questions to build your revision library."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">

          {filteredQuestions.map((item) => {
            const today = getTodayDate();

            const completedToday =
              item.completedDates?.includes(today) ?? false;

            const isEditing =
              editingId === item._id;

            return (
              <motion.div
                key={item._id}
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className={`rounded-2xl border bg-white p-5 shadow-sm ${
                  completedToday
                    ? "border-[#b9ddc8]"
                    : "border-[#e5e8e3]"
                }`}
              >

                {/* Card header */}

                <div className="flex items-start justify-between gap-4">

                  <div className="min-w-0 flex-1">

                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        completedToday
                          ? "bg-[#e8f5ed] text-[#1f7a4d]"
                          : "bg-[#e8f5ed] text-[#1f7a4d]"
                      }`}
                    >
                      {item.topic.name}
                    </span>

                    {isEditing ? (

                      /* EDIT */

                      <form
                        onSubmit={handleUpdate}
                        className="mt-4 space-y-4"
                      >

                        <div>
                          <label className="text-sm font-medium text-[#171a17]">
                            Topic
                          </label>

                          <select
                            value={editTopicId}
                            onChange={(e) =>
                              setEditTopicId(
                                e.target.value
                              )
                            }
                            className="mt-2 w-full rounded-xl border border-[#e5e8e3] bg-white px-4 py-3 text-sm outline-none focus:border-[#1f7a4d]"
                          >
                            {topics.map((topic) => (
                              <option
                                key={topic._id}
                                value={topic._id}
                              >
                                {topic.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[#171a17]">
                            Question
                          </label>

                          <textarea
                            value={editQuestion}
                            onChange={(e) =>
                              setEditQuestion(
                                e.target.value
                              )
                            }
                            rows={3}
                            className="mt-2 w-full resize-none rounded-xl border border-[#e5e8e3] px-4 py-3 text-sm outline-none focus:border-[#1f7a4d]"
                            required
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-[#171a17]">
                            Answer
                          </label>

                          <textarea
                            value={editAnswer}
                            onChange={(e) =>
                              setEditAnswer(
                                e.target.value
                              )
                            }
                            rows={5}
                            className="mt-2 w-full resize-none rounded-xl border border-[#e5e8e3] px-4 py-3 text-sm outline-none focus:border-[#1f7a4d]"
                            required
                          />
                        </div>

                        <div className="flex justify-end gap-3">

                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded-xl border border-[#e5e8e3] px-4 py-2.5 text-sm font-medium text-[#555b55] transition hover:bg-[#f7f8f5]"
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-[#1f7a4d] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#17633d] disabled:opacity-60"
                          >
                            {saving
                              ? "Saving..."
                              : "Save Changes"}
                          </button>

                        </div>
                      </form>

                    ) : (

                      /* NORMAL VIEW */

                      <>
                        <h3 className="mt-3 text-base font-semibold text-[#171a17]">
                          {item.question}
                        </h3>

                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6b716b]">
                          {item.answer}
                        </p>

                        {/* Actions */}

                        <div className="mt-5 flex flex-wrap items-center gap-2">

                          {/* Complete */}

                          <button
                            type="button"
                            onClick={() =>
                              handleComplete(item._id)
                            }
                            disabled={
                              completedToday ||
                              completingId === item._id
                            }
                            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                              completedToday
                                ? "cursor-default bg-[#e8f5ed] text-[#1f7a4d]"
                                : "bg-[#1f7a4d] text-white hover:bg-[#17633d]"
                            } disabled:cursor-not-allowed`}
                          >
                            <CheckCircle2 size={17} />

                            {completedToday
                              ? "Completed today"
                              : completingId === item._id
                              ? "Completing..."
                              : "Complete"}
                          </button>

                          {/* Edit */}

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(item)
                            }
                            className="rounded-xl border border-[#e5e8e3] p-2.5 text-[#6b716b] transition hover:bg-[#f7f8f5] hover:text-[#1f7a4d]"
                            title="Edit"
                          >
                            <Pencil size={17} />
                          </button>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(item._id)
                            }
                            className="rounded-xl border border-[#e5e8e3] p-2.5 text-[#6b716b] transition hover:bg-red-50 hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 size={17} />
                          </button>

                        </div>

                      </>
                    )}

                  </div>

                </div>

              </motion.div>
            );
          })}

        </div>
      )}

    </div>
  );
}