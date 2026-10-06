"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import {
  Send,
  MessageCircle,
  Wifi,
  WifiOff,
} from "lucide-react";
import api from "@/lib/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type Message = {
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Page Load
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    console.log("=================================");
    console.log("🚀 STUDYTRACK CHAT PAGE LOADED");
    console.log("🌐 SOCKET URL:", SOCKET_URL);
    console.log("=================================");

    const token = localStorage.getItem("token");

    console.log("🔑 Token exists:", !!token);

    if (!token) {
      console.error("❌ No authentication token found");
      setLoading(false);
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Load Current User
    |--------------------------------------------------------------------------
    */

    const loadUser = async () => {
      try {
        console.log("👤 Loading current user...");

        const response = await api.get("/auth/me");

        console.log("✅ Current user:", response.data);

        const currentUser = response.data.user || response.data;

        setUser({
          id: currentUser.id || currentUser._id,
          name: currentUser.name,
          email: currentUser.email,
        });
      } catch (error) {
        console.error("❌ Failed to load user:", error);

        /*
         * Fallback to localStorage user
         */
        try {
          const storedUser = localStorage.getItem("user");

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);

            console.log(
              "👤 Using localStorage user:",
              parsedUser
            );

            setUser({
              id: parsedUser.id || parsedUser._id,
              name: parsedUser.name,
              email: parsedUser.email,
            });
          }
        } catch (storageError) {
          console.error(
            "❌ Failed to read localStorage user:",
            storageError
          );
        }
      }
    };

    /*
    |--------------------------------------------------------------------------
    | Load Previous Messages
    |--------------------------------------------------------------------------
    */

    const loadMessages = async () => {
      try {
        console.log("📚 Loading previous messages...");

        const response = await api.get("/chat/messages");

        console.log(
          "✅ Previous messages:",
          response.data
        );

        const formattedMessages = response.data.map(
          (message: any) => ({
            id: message._id || message.id,
            senderId:
              message.sender?._id ||
              message.sender?.id ||
              message.senderId,
            senderName:
              message.sender?.name ||
              message.senderName ||
              "User",
            text: message.text,
            createdAt: message.createdAt,
          })
        );

        setMessages(formattedMessages);
      } catch (error) {
        console.error(
          "❌ Failed to load messages:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    loadMessages();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Socket Connection
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error(
        "❌ Cannot connect socket: token missing"
      );
      return;
    }

    console.log("=================================");
    console.log("🔌 CREATING SOCKET CONNECTION");
    console.log("🌐 URL:", SOCKET_URL);
    console.log("=================================");

    const socket = io(SOCKET_URL, {
      auth: {
        token,
      },

      transports: ["websocket", "polling"],

      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    /*
    |--------------------------------------------------------------------------
    | Socket Connecting
    |--------------------------------------------------------------------------
    */

    socket.on("connect", () => {
      console.log("=================================");
      console.log("🟢 SOCKET CONNECTED");
      console.log("🆔 Socket ID:", socket.id);
      console.log("🌐 URL:", SOCKET_URL);
      console.log("=================================");

      setConnected(true);
    });

    /*
    |--------------------------------------------------------------------------
    | Socket Disconnect
    |--------------------------------------------------------------------------
    */

    socket.on("disconnect", (reason) => {
      console.log("=================================");
      console.log("🔴 SOCKET DISCONNECTED");
      console.log("📌 Reason:", reason);
      console.log("=================================");

      setConnected(false);
    });

    /*
    |--------------------------------------------------------------------------
    | Socket Error
    |--------------------------------------------------------------------------
    */

    socket.on("connect_error", (error) => {
      console.error("=================================");
      console.error("❌ SOCKET CONNECTION ERROR");
      console.error("📌 Error:", error.message);
      console.error("=================================");

      setConnected(false);
    });

    /*
    |--------------------------------------------------------------------------
    | Reconnect Attempt
    |--------------------------------------------------------------------------
    */

    socket.io.on("reconnect_attempt", (attempt) => {
      console.log(
        "🔄 Socket reconnect attempt:",
        attempt
      );
    });

    socket.io.on("reconnect", (attempt) => {
      console.log(
        "🟢 Socket reconnected after attempt:",
        attempt
      );
    });

    /*
    |--------------------------------------------------------------------------
    | Receive Message
    |--------------------------------------------------------------------------
    */

    socket.on("receive-message", (message: Message) => {
      console.log("=================================");
      console.log("📩 RECEIVE-MESSAGE EVENT");
      console.log("📦 Message:", message);
      console.log("=================================");

      setMessages((previousMessages) => {
        console.log(
          "📚 Previous messages:",
          previousMessages.length
        );

        return [
          ...previousMessages,
          message,
        ];
      });
    });

    /*
    |--------------------------------------------------------------------------
    | User Joined
    |--------------------------------------------------------------------------
    */

    socket.on("user-joined", (data) => {
      console.log(
        "👋 USER JOINED:",
        data
      );
    });

    /*
    |--------------------------------------------------------------------------
    | User Left
    |--------------------------------------------------------------------------
    */

    socket.on("user-left", (data) => {
      console.log(
        "👋 USER LEFT:",
        data
      );
    });

    /*
    |--------------------------------------------------------------------------
    | Cleanup
    |--------------------------------------------------------------------------
    */

    return () => {
      console.log(
        "🧹 Cleaning up socket connection..."
      );

      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Auto Scroll
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /*
  |--------------------------------------------------------------------------
  | Send Message
  |--------------------------------------------------------------------------
  */

  const handleSendMessage = (
    event: FormEvent
  ) => {
    event.preventDefault();

    console.log("=================================");
    console.log("📤 SEND MESSAGE CLICKED");
    console.log("=================================");

    const socket = socketRef.current;

    if (!socket) {
      console.error(
        "❌ Socket object does not exist"
      );
      return;
    }

    console.log(
      "🆔 Socket ID:",
      socket.id
    );

    console.log(
      "🟢 Socket connected:",
      socket.connected
    );

    const trimmedText = text.trim();

    console.log(
      "📤 Sending text:",
      trimmedText
    );

    if (!trimmedText) {
      console.log(
        "⚠️ Message is empty"
      );
      return;
    }

    if (!socket.connected) {
      console.error(
        "❌ Socket is not connected"
      );
      return;
    }

    if (trimmedText.length > 1000) {
      console.error(
        "❌ Message exceeds 1000 characters"
      );
      return;
    }

    setSending(true);

    console.log(
      "📡 Emitting send-message..."
    );

    socket.emit(
      "send-message",
      {
        text: trimmedText,
      },
      () => {
        console.log(
          "✅ send-message callback received"
        );
      }
    );

    console.log(
      "✅ send-message EVENT EMITTED"
    );

    setText("");
    setSending(false);

    inputRef.current?.focus();
  };

  /*
  |--------------------------------------------------------------------------
  | Input Change
  |--------------------------------------------------------------------------
  */

  const handleInputChange = (
    value: string
  ) => {
    console.log(
      "⌨️ Input:",
      value
    );

    setText(value);
  };

  /*
  |--------------------------------------------------------------------------
  | Format Time
  |--------------------------------------------------------------------------
  */

  const formatTime = (
    date: string
  ) => {
    try {
      return new Date(date).toLocaleTimeString(
        "en-IN",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-0px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[var(--primary)]" />

          <p className="text-sm text-gray-500">
            Loading Community Chat...
          </p>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col bg-[#fafafa]">
      {/* Header */}

      <div className="flex h-20 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--primary-light)] text-[var(--primary)]">
            <MessageCircle size={21} />
          </div>

          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              Community Chat
            </h1>

            <p className="text-xs text-gray-500">
              Talk with other StudyTrack students
            </p>
          </div>
        </div>

        {/* Connection Status */}

        <div
          className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${
            connected
              ? "bg-green-50 text-green-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {connected ? (
            <>
              <Wifi size={14} />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff size={14} />
              <span>Disconnected</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-3">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <MessageCircle size={26} />
                </div>

                <h2 className="mt-4 text-sm font-semibold text-gray-800">
                  No messages yet
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Start the conversation with the
                  community.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage =
                message.senderId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isOwnMessage
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] sm:max-w-[65%] ${
                      isOwnMessage
                        ? "items-end"
                        : "items-start"
                    }`}
                  >
                    {/* Sender */}

                    {!isOwnMessage && (
                      <p className="mb-1 ml-1 text-xs font-medium text-gray-500">
                        {message.senderName}
                      </p>
                    )}

                    {/* Message */}

                    <div
                      className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        isOwnMessage
                          ? "rounded-br-md bg-[var(--primary)] text-white"
                          : "rounded-bl-md border border-gray-200 bg-white text-gray-800"
                      }`}
                    >
                      <p className="break-words whitespace-pre-wrap">
                        {message.text}
                      </p>

                      <div
                        className={`mt-1 text-[10px] ${
                          isOwnMessage
                            ? "text-white/70"
                            : "text-gray-400"
                        }`}
                      >
                        {formatTime(
                          message.createdAt
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}

      <div className="shrink-0 border-t border-gray-200 bg-white px-4 py-4 sm:px-6">
        <form
          onSubmit={handleSendMessage}
          className="mx-auto flex max-w-4xl items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(event) =>
              handleInputChange(
                event.target.value
              )
            }
            placeholder={
              connected
                ? "Write a message..."
                : "Connecting..."
            }
            disabled={!connected || sending}
            maxLength={1000}
            className="h-12 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900 outline-none transition focus:border-[var(--primary)] focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={
              !connected ||
              !text.trim() ||
              sending
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </form>

        <div className="mx-auto mt-2 flex max-w-4xl justify-between px-1">
          <p className="text-[11px] text-gray-400">
            Messages are visible to the StudyTrack
            community.
          </p>

          <p className="text-[11px] text-gray-400">
            {text.length}/1000
          </p>
        </div>
      </div>
    </div>
  );
}