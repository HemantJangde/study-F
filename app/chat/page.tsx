"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  MessageCircle,
  Send,
  Users,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import api from "@/lib/api";

type User = {
  id: string;
  name: string;
  email?: string;
};

type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:5000";

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(
    []
  );
  const [input, setInput] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [notificationPermission, setNotificationPermission] =
    useState<NotificationPermission>("default");

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // --------------------------------------------------
  // Load logged-in user
  // --------------------------------------------------

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error("Invalid user data:", error);
    }
  }, []);

  // --------------------------------------------------
  // Check notification permission
  // --------------------------------------------------

  useEffect(() => {
    if (!("Notification" in window)) {
      return;
    }

    setNotificationPermission(
      Notification.permission
    );
  }, []);

  // --------------------------------------------------
  // Request notification permission
  // --------------------------------------------------

  const enableNotifications = async () => {
    if (!("Notification" in window)) {
      alert(
        "Your browser does not support notifications."
      );
      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      setNotificationPermission(permission);
    } catch (error) {
      console.error(
        "Notification permission error:",
        error
      );
    }
  };

  // --------------------------------------------------
  // Socket connection
  // --------------------------------------------------

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    // -----------------------------
    // Connected
    // -----------------------------

    socket.on("connect", () => {
      console.log(
        "Chat connected:",
        socket.id
      );

      setConnected(true);
    });

    // -----------------------------
    // Connection error
    // -----------------------------

    socket.on("connect_error", (error) => {
      console.error(
        "Chat connection error:",
        error.message
      );

      setConnected(false);
    });

    // -----------------------------
    // Disconnected
    // -----------------------------

    socket.on("disconnect", () => {
      console.log("Chat disconnected");

      setConnected(false);
    });

    // -----------------------------
    // Receive message
    // -----------------------------

    socket.on(
       "receive-message",
  (message: ChatMessage) => {
    console.log(
      "🔥 RECEIVE MESSAGE:",
      message
    );

        // Add message to chat
        setMessages((currentMessages) => {
          const exists = currentMessages.some(
            (item) => item.id === message.id
          );

          if (exists) {
            return currentMessages;
          }

          return [...currentMessages, message];
        });

        // -----------------------------------------
        // Don't notify for your own messages
        // -----------------------------------------

        const currentUser =
          localStorage.getItem("user");

        let currentUserId = null;

        if (currentUser) {
          try {
            const parsedUser =
              JSON.parse(currentUser);

            currentUserId = parsedUser.id;
          } catch (error) {
            console.error(
              "Failed to read current user:",
              error
            );
          }
        }

        if (
          currentUserId &&
          message.senderId === currentUserId
        ) {
          return;
        }

        // -----------------------------------------
        // Don't notify if chat is currently visible
        // -----------------------------------------

        if (
          document.visibilityState === "visible"
        ) {
          return;
        }

        // -----------------------------------------
        // Browser notification
        // -----------------------------------------

        if (
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          const notification =
            new Notification(
              `New message from ${message.senderName}`,
              {
                body: message.text,
                icon: "/icon.png",
                tag: `studytrack-chat-${message.id}`,
              }
            );

          notification.onclick = () => {
            window.focus();

            notification.close();

            window.location.href = "/chat";
          };
        }
      }
    );

    // -----------------------------------------
    // Load previous messages
    // -----------------------------------------

    const loadHistory = async () => {
      try {
        const response = await api.get(
          "/chat/messages"
        );

        const history: ChatMessage[] =
          response.data.map((item: any) => ({
            id: item._id,
            senderId: item.sender?._id,
            senderName:
              item.sender?.name || "User",
            text: item.text,
            createdAt: item.createdAt,
          }));

        setMessages((currentMessages) => {
          const messageMap = new Map<
            string,
            ChatMessage
          >();

          history.forEach((message) => {
            messageMap.set(
              message.id,
              message
            );
          });

          currentMessages.forEach((message) => {
            messageMap.set(
              message.id,
              message
            );
          });

          return Array.from(
            messageMap.values()
          ).sort(
            (a, b) =>
              new Date(
                a.createdAt
              ).getTime() -
              new Date(
                b.createdAt
              ).getTime()
          );
        });
      } catch (error) {
        console.error(
          "Failed to load chat history:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();

    // -----------------------------------------
    // Cleanup
    // -----------------------------------------

    return () => {
      socket.removeAllListeners();
      socket.disconnect();

      socketRef.current = null;
    };
  }, []);

  // --------------------------------------------------
  // Auto scroll
  // --------------------------------------------------

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // --------------------------------------------------
  // Send message
  // --------------------------------------------------

  const sendMessage = () => {
    const text = input.trim();

    if (!text) {
      return;
    }

    if (!socketRef.current) {
      return;
    }

    if (!connected) {
      return;
    }

    socketRef.current.emit(
      "send-message",
      {
        text,
      }
    );

    setInput("");
  };

  // --------------------------------------------------
  // Enter key
  // --------------------------------------------------

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      sendMessage();
    }
  };

  // --------------------------------------------------
  // Format time
  // --------------------------------------------------

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col bg-[var(--background)]">
      {/* ==========================================
          HEADER
      ========================================== */}

      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {/* Icon */}

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
            <MessageCircle size={20} />
          </div>

          {/* Title */}

          <div>
            <h1 className="text-base font-semibold text-gray-900 sm:text-lg">
              Community Chat
            </h1>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  connected
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              />

              <span className="text-xs text-[var(--muted)]">
                {connected
                  ? "Online"
                  : "Connecting..."}
              </span>
            </div>
          </div>
        </div>

        {/* Right side */}

        <div className="flex items-center gap-2">
          {/* Notification button */}

         {notificationPermission !== "granted" && (
  <button
    type="button"
    onClick={enableNotifications}
    className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
    title="Enable notifications"
  >
    <Bell size={16} />

    <span className="hidden sm:inline">
      Enable notifications
    </span>
  </button>
)}

          {/* Community label */}

          <div className="hidden items-center gap-2 rounded-xl bg-gray-50 px-3 py-2 sm:flex">
            <Users
              size={17}
              className="text-gray-500"
            />

            <span className="text-sm text-gray-600">
              StudyTrack Community
            </span>
          </div>
        </div>
      </header>

      {/* ==========================================
          MESSAGES
      ========================================== */}

      <main className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {/* Loading */}

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-sm text-[var(--muted)]">
                Loading community...
              </div>
            </div>
          ) : messages.length === 0 ? (
            /* Empty state */
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm">
                  <MessageCircle size={28} />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-gray-900">
                  Start the conversation
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Ask questions, share what you
                  are learning, or help another
                  student.
                </p>
              </div>
            </div>
          ) : (
            /* Messages */
            <div className="space-y-4">
              {messages.map((message) => {
                const isMine =
                  message.senderId ===
                  user?.id;

                return (
                  <div
                    key={message.id}
                    className={`flex ${
                      isMine
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[85%] flex-col sm:max-w-[65%] ${
                        isMine
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      {/* Sender */}

                      {!isMine && (
                        <div className="mb-1 px-1 text-xs font-semibold text-[var(--primary)]">
                          {message.senderName}
                        </div>
                      )}

                      {/* Message bubble */}

                      <div
                        className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                          isMine
                            ? "rounded-br-md bg-[var(--primary)] text-white"
                            : "rounded-bl-md border border-[var(--border)] bg-white text-gray-700"
                        }`}
                      >
                        {message.text}
                      </div>

                      {/* Time */}

                      <span className="mt-1 px-1 text-[10px] text-gray-400">
                        {formatTime(
                          message.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </main>

      {/* ==========================================
          MESSAGE INPUT
      ========================================== */}

      <footer className="shrink-0 border-t border-[var(--border)] bg-white p-3 sm:p-4">
        <div className="mx-auto flex max-w-4xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={
              connected
                ? "Write a message..."
                : "Connecting to chat..."
            }
            disabled={!connected}
            maxLength={1000}
            className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={
              !connected ||
              !input.trim()
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}