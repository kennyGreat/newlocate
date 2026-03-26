"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, MessageCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  anonymousId: string;
  isOwn: boolean;
  createdAt: string;
}

interface ChatRoom {
  id: string;
  participants: Array<{
    anonymousId: string;
    user: { id: string; name: string; avatar?: string | null };
  }>;
  messages: Message[];
  updatedAt: string;
}

function ChatContent() {
  const searchParams = useSearchParams();
  const activeRoomId = searchParams.get("room");

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadRooms = useCallback(async () => {
    const res = await fetch("/api/chat/rooms");
    const data = await res.json();
    setRooms(data.rooms || []);
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    setLoading(true);
    const res = await fetch(`/api/chat/rooms/${roomId}`);
    const data = await res.json();
    setMessages(data.messages || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (activeRoomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === activeRoomId);
      if (room) {
        setActiveRoom(room);
        loadMessages(activeRoomId);
      }
    }
  }, [activeRoomId, rooms, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!activeRoom) return;
    const interval = setInterval(() => loadMessages(activeRoom.id), 5000);
    return () => clearInterval(interval);
  }, [activeRoom, loadMessages]);

  const sendMessage = async () => {
    if (!input.trim() || !activeRoom || sendingMsg) return;
    setSendingMsg(true);
    const content = input;
    setInput("");

    const res = await fetch(`/api/chat/rooms/${activeRoom.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages(prev => [...prev, data.message]);
    }
    setSendingMsg(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 200px)", minHeight: "500px" }}>
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 border-r border-gray-100 flex flex-col">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-gray-900">Chats</h2>
              </div>
              <div className="flex items-center gap-1 mt-1 text-xs text-green-600 bg-green-50 rounded-full px-2 py-0.5 w-fit">
                <Shield className="h-3 w-3" />
                Anonymous mode
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {rooms.length === 0 ? (
                <div className="p-4 text-center text-gray-400 text-sm">
                  <p>No conversations yet.</p>
                  <p className="mt-1">Start by clicking "Chat Anonymously" on a property.</p>
                </div>
              ) : (
                rooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => {
                      setActiveRoom(room);
                      loadMessages(room.id);
                    }}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 ${activeRoom?.id === room.id ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-600">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Anonymous Chat
                        </p>
                        {room.messages?.[0] && (
                          <p className="text-xs text-gray-400 truncate">
                            {room.messages[0].content}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main chat area */}
          {activeRoom ? (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Anonymous Chat</h3>
                  <p className="text-xs text-gray-500">
                    Phone numbers and addresses are automatically hidden
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
                  <Shield className="h-3 w-3" />
                  Secure & Private
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loading ? (
                  <div className="text-center text-gray-400 text-sm">Loading...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-8">
                    <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Start the conversation!</p>
                    <p className="text-xs mt-1">Your identity is protected</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-xs lg:max-w-md ${msg.isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <div className={`px-4 py-2 rounded-2xl text-sm ${msg.isOwn ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-900 rounded-bl-sm"}`}>
                          {msg.content}
                        </div>
                        <span className="text-xs text-gray-400">
                          {msg.anonymousId} · {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message... (phone numbers will be hidden)"
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <Button onClick={sendMessage} loading={sendingMsg} size="sm">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Select a conversation</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Or start one by clicking &quot;Chat Anonymously&quot; on a property
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
