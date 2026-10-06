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

console.log("=================================");
console.log("🚀 STUDYTRACK CHAT PAGE LOADED");
console.log("🌐 SOCKET URL:", SOCKET_URL);
console.log("=================================");

export default function ChatPage() {
  const [user, setUser] = useState<User | null>(
    null
  );

  const [messages, setMessages] = useState<
    ChatMessage[]
  >([]);

  const [input, setInput] = useState("");

  const [connected, setConnected] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [
    notificationPermission,
    setNotificationPermission,
  ] = useState<NotificationPermission>("default");

  const socketRef =
    useRef<Socket | null>(null);

  const bottomRef =
    useRef<HTMLDivElement | null>(null);

  // ==================================================
  // LOAD USER
  // ==================================================

  useEffect(() => {
    console.log("👤 Loading logged-in user...");

    const storedUser =
      localStorage.getItem("user");

    if (!storedUser) {
      console.error(
        "❌ No user found in localStorage"
      );

      setLoading(false);

      return;
    }

    try {
      const parsedUser = JSON.parse(
        storedUser
      );

      console.log(
        "✅ Current user:",
        parsedUser
      );

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "❌ Failed to parse user:",
        error
      );
    }
  }, []);

  // ==================================================
  // NOTIFICATION PERMISSION
  // ==================================================

  useEffect(() => {
    console.log(
      "🔔 Checking notification support..."
    );

    if (!("Notification" in window)) {
      console.warn(
        "⚠️ Browser does not support notifications"
      );

      return;
    }

    console.log(
      "🔔 Current notification permission:",
      Notification.permission
    );

    setNotificationPermission(
      Notification.permission
    );
  }, []);

  // ==================================================
  // ENABLE NOTIFICATIONS
  // ==================================================

  const enableNotifications = async () => {
    console.log(
      "🔔 Requesting notification permission..."
    );

    if (!("Notification" in window)) {
      console.error(
        "❌ Notification API not supported"
      );

      return;
    }

    try {
      const permission =
        await Notification.requestPermission();

      console.log(
        "🔔 Notification permission result:",
        permission
      );

      setNotificationPermission(
        permission
      );
    } catch (error) {
      console.error(
        "❌ Notification permission error:",
        error
      );
    }
  };

  // ==================================================
  // SOCKET CONNECTION
  // ==================================================

  useEffect(() => {
    console.log(
      "================================="
    );

    console.log(
      "🔌 STARTING SOCKET CONNECTION"
    );

    console.log(
      "🌐 Socket URL:",
      SOCKET_URL
    );

    console.log(
      "================================="
    );

    const token =
      localStorage.getItem("token");

    if (!token) {
      console.error(
        "❌ JWT token not found"
      );

      setLoading(false);

      return;
    }

    console.log(
      "🔐 JWT token found"
    );

    console.log(
      "🔌 Creating Socket.IO connection..."
    );

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },

      transports: [
        "websocket",
        "polling",
      ],

      reconnection: true,

      reconnectionAttempts: 10,

      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // ==================================================
    // CONNECT
    // ==================================================

    socket.on("connect", () => {
      console.log(
        "================================="
      );

      console.log(
        "🟢 SOCKET CONNECTED"
      );

      console.log(
        "🆔 Socket ID:",
        socket.id
      );

      console.log(
        "🌐 Connected URL:",
        SOCKET_URL
      );

      console.log(
        "================================="
      );

      setConnected(true);
    });

    // ==================================================
    // CONNECT ERROR
    // ==================================================

    socket.on(
      "connect_error",
      (error) => {
        console.error(
          "================================="
        );

        console.error(
          "🔴 SOCKET CONNECTION ERROR"
        );

        console.error(
          "Message:",
          error.message
        );

        console.error(
          "Error:",
          error
        );

        console.error(
          "================================="
        );

        setConnected(false);
      }
    );

    // ==================================================
    // DISCONNECT
    // ==================================================

    socket.on(
      "disconnect",
      (reason) => {
        console.warn(
          "================================="
        );

        console.warn(
          "🟠 SOCKET DISCONNECTED"
        );

        console.warn(
          "Reason:",
          reason
        );

        console.warn(
          "================================="
        );

        setConnected(false);
      }
    );

    // ==================================================
    // RECONNECT ATTEMPT
    // ==================================================

    socket.io.on(
      "reconnect_attempt",
      (attempt) => {
        console.log(
          "🔄 Reconnect attempt:",
          attempt
        );
      }
    );

    // ==================================================
    // RECONNECT
    // ==================================================

    socket.io.on(
      "reconnect",
      (attempt) => {
        console.log(
          "🟢 Socket reconnected after attempt:",
          attempt
        );
      }
    );

    // ==================================================
    // RECEIVE MESSAGE
    // ==================================================

    socket.on(
      "receive-message",
      (message: ChatMessage) => {
        console.log(
          "================================="
        );

        console.log(
          "📩 RECEIVE-MESSAGE EVENT"
        );

        console.log(
          "📩 Message:",
          message
        );

        console.log(
          "📩 Message ID:",
          message.id
        );

        console.log(
          "📩 Sender ID:",
          message.senderId
        );

        console.log(
          "📩 Sender:",
          message.senderName
        );

        console.log(
          "📩 Text:",
          message.text
        );

        console.log(
          "================================="
        );

        // ------------------------------------------
        // ADD MESSAGE TO STATE
        // ------------------------------------------

        setMessages(
          (currentMessages) => {
            console.log(
              "📦 Current messages:",
              currentMessages.length
            );

            const exists =
              currentMessages.some(
                (item) =>
                  item.id === message.id
              );

            if (exists) {
              console.log(
                "⚠️ Message already exists:",
                message.id
              );

              return currentMessages;
            }

            console.log(
              "✅ Adding new message to state"
            );

            const updatedMessages = [
              ...currentMessages,
              message,
            ];

            console.log(
              "📦 New message count:",
              updatedMessages.length
            );

            return updatedMessages;
          }
        );

        // ------------------------------------------
        // CHECK CURRENT USER
        // ------------------------------------------

        const storedUser =
          localStorage.getItem("user");

        let currentUserId: string | null =
          null;

        if (storedUser) {
          try {
            const parsedUser =
              JSON.parse(storedUser);

            currentUserId =
              parsedUser.id;

            console.log(
              "👤 Current user ID:",
              currentUserId
            );
          } catch (error) {
            console.error(
              "❌ User parsing error:",
              error
            );
          }
        }

        // ------------------------------------------
        // OWN MESSAGE
        // ------------------------------------------

        if (
          currentUserId &&
          message.senderId ===
            currentUserId
        ) {
          console.log(
            "ℹ️ This is my own message. No notification."
          );

          return;
        }

        // ------------------------------------------
        // PAGE VISIBILITY
        // ------------------------------------------

        console.log(
          "👁️ Page visibility:",
          document.visibilityState
        );

        if (
          document.visibilityState ===
          "visible"
        ) {
          console.log(
            "ℹ️ Chat page is visible. No notification."
          );

          return;
        }

        // ------------------------------------------
        // NOTIFICATION
        // ------------------------------------------

        if (
          "Notification" in window
        ) {
          console.log(
            "🔔 Notification permission:",
            Notification.permission
          );

          if (
            Notification.permission ===
            "granted"
          ) {
            console.log(
              "🔔 Creating browser notification..."
            );

            const notification =
              new Notification(
                `New message from ${message.senderName}`,
                {
                  body: message.text,

                  icon: "/icon.png",

                  tag: `studytrack-${message.id}`,
                }
              );

            notification.onclick = () => {
              console.log(
                "🔔 Notification clicked"
              );

              window.focus();

              notification.close();

              window.location.href =
                "/chat";
            };
          } else {
            console.warn(
              "⚠️ Notification permission not granted"
            );
          }
        }
      }
    );

    // ==================================================
    // LOAD CHAT HISTORY
    // ==================================================

    const loadHistory = async () => {
      console.log(
        "================================="
      );

      console.log(
        "📚 LOADING CHAT HISTORY"
      );

      console.log(
        "GET /chat/messages"
      );

      console.log(
        "================================="
      );

      try {
        const response =
          await api.get(
            "/chat/messages"
          );

        console.log(
          "✅ Chat history response:",
          response.data
        );

        const history: ChatMessage[] =
          response.data.map(
            (item: any) => ({
              id: item._id,

              senderId:
                item.sender?._id,

              senderName:
                item.sender?.name ||
                "User",

              text: item.text,

              createdAt:
                item.createdAt,
            })
          );

        console.log(
          "📚 Converted history:",
          history
        );

        setMessages(
          (currentMessages) => {
            const messageMap =
              new Map<
                string,
                ChatMessage
              >();

            // History first

            history.forEach(
              (message) => {
                messageMap.set(
                  message.id,
                  message
                );
              }
            );

            // Keep realtime messages

            currentMessages.forEach(
              (message) => {
                messageMap.set(
                  message.id,
                  message
                );
              }
            );

            const merged =
              Array.from(
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

            console.log(
              "📚 Final message count:",
              merged.length
            );

            return merged;
          }
        );
      } catch (error) {
        console.error(
          "================================="
        );

        console.error(
          "❌ CHAT HISTORY ERROR"
        );

        console.error(
          error
        );

        console.error(
          "================================="
        );
      } finally {
        console.log(
          "📚 Chat history loading finished"
        );

        setLoading(false);
      }
    };

    loadHistory();

    // ==================================================
    // CLEANUP
    // ==================================================

    return () => {
      console.log(
        "🧹 Cleaning up socket..."
      );

      socket.removeAllListeners();

      socket.disconnect();

      socketRef.current =
        null;
    };
  }, []);

  // ==================================================
  // MESSAGE STATE DEBUG
  // ==================================================

  useEffect(() => {
    console.log(
      "📦 MESSAGES STATE UPDATED:",
      messages
    );

    console.log(
      "📦 TOTAL MESSAGES:",
      messages.length
    );
  }, [messages]);

  // ==================================================
  // AUTO SCROLL
  // ==================================================

  useEffect(() => {
    console.log(
      "📜 Auto scrolling to bottom"
    );

    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ==================================================
  // SEND MESSAGE
  // ==================================================

  const sendMessage = () => {
    console.log(
      "================================="
    );

    console.log(
      "📤 SEND MESSAGE CLICKED"
    );

    console.log(
      "================================="
    );

    const text = input.trim();

    // ------------------------------------------
    // EMPTY
    // ------------------------------------------

    if (!text) {
      console.warn(
        "⚠️ Cannot send empty message"
      );

      return;
    }

    // ------------------------------------------
    // SOCKET
    // ------------------------------------------

    if (!socketRef.current) {
      console.error(
        "❌ Socket reference does not exist"
      );

      return;
    }

    // ------------------------------------------
    // CONNECTION
    // ------------------------------------------

    if (!connected) {
      console.error(
        "❌ Socket is not connected"
      );

      return;
    }

    // ------------------------------------------
    // SOCKET ID
    // ------------------------------------------

    console.log(
      "🆔 Socket ID:",
      socketRef.current.id
    );

    console.log(
      "🟢 Socket connected:",
      socketRef.current.connected
    );

    console.log(
      "📤 Sending text:",
      text
    );

    // ------------------------------------------
    // EMIT
    // ------------------------------------------

    socketRef.current.emit(
      "send-message",
      {
        text,
      }
    );

    console.log(
      "✅ send-message EVENT EMITTED"
    );

    // ------------------------------------------
    // CLEAR INPUT
    // ------------------------------------------

    setInput("");
  };

  // ==================================================
  // ENTER KEY
  // ==================================================

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      console.log(
        "⌨️ Enter pressed"
      );

      sendMessage();
    }
  };

  // ==================================================
  // FORMAT TIME
  // ==================================================

  const formatTime = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col bg-[var(--background)]">
      {/* ============================================
          HEADER
      ============================================ */}

      <header className="flex shrink-0 items-center justify-between border-b border-[var(--border)] bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
            <MessageCircle size={20} />
          </div>

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

        <div className="flex items-center gap-2">
          {/* Notification */}

          {notificationPermission !==
            "granted" && (
            <button
              type="button"
              onClick={
                enableNotifications
              }
              className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
            >
              <Bell size={16} />

              <span className="hidden sm:inline">
                Enable notifications
              </span>
            </button>
          )}

          {/* Community */}

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

      {/* ============================================
          MESSAGES
      ============================================ */}

      <main className="flex-1 overflow-y-auto px-3 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="text-sm text-[var(--muted)]">
                Loading community...
              </div>
            </div>
          ) : messages.length ===
            0 ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="max-w-sm text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--primary)] shadow-sm">
                  <MessageCircle size={28} />
                </div>

                <h2 className="mt-5 text-lg font-semibold text-gray-900">
                  Start the conversation
                </h2>

                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Ask questions, share what
                  you are learning, or help
                  another student.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(
                (message) => {
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
                        {!isMine && (
                          <div className="mb-1 px-1 text-xs font-semibold text-[var(--primary)]">
                            {
                              message.senderName
                            }
                          </div>
                        )}

                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
                            isMine
                              ? "rounded-br-md bg-[var(--primary)] text-white"
                              : "rounded-bl-md border border-[var(--border)] bg-white text-gray-700"
                          }`}
                        >
                          {
                            message.text
                          }
                        </div>

                        <span className="mt-1 px-1 text-[10px] text-gray-400">
                          {formatTime(
                            message.createdAt
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }
              )}

              <div
                ref={bottomRef}
              />
            </div>
          )}
        </div>
      </main>

      {/* ============================================
          INPUT
      ============================================ */}

      <footer className="shrink-0 border-t border-[var(--border)] bg-white p-3 sm:p-4">
        <div className="mx-auto flex max-w-4xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => {
              console.log(
                "⌨️ Input:",
                event.target.value
              );

              setInput(
                event.target.value
              );
            }}
            onKeyDown={
              handleKeyDown
            }
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