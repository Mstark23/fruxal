// =============================================================================
// V2 CHAT INTERFACE — AI Consultation with embedded tool cards
// =============================================================================
// The main product experience. User talks to AI about their leaks.
// AI responses can contain [TOOL_CARD] blocks rendered as clickable cards.
// Conversation history saved for returning users.
// =============================================================================

"use client";

import { useState, useRef, useEffect } from "react";
import { ToolCard, parseToolCards } from "./ToolCard";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

interface ChatInterfaceProps {
  userId: string;
  scanId?: string;
  conversationId?: string;
  initialMessages?: Message[];
  industryDisplay?: string;
  leakCount?: number;
  totalLeak?: number;
}

export function ChatInterface({
  userId,
  scanId,
  conversationId: initialConvId,
  initialMessages = [],
  industryDisplay,
  leakCount,
  totalLeak,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(initialConvId);
  const [error, setError] = useState<string | null>(null);
  const [paywalled, setPaywalled] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Send initial greeting if no messages
  useEffect(() => {
    if (messages.length === 0 && !loading) {
      sendMessage("Hi, I just completed my scan. Walk me through my results.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setInput("");
    setError(null);
    const userMsg: Message = { role: "user", content: msg, timestamp: new Date().toISOString() };
    
    // Don't show the auto-greeting in the UI
    if (!text) {
      setMessages(prev => [...prev, userMsg]);
    }
    setLoading(true);

    try {
      const res = await fetch("/api/v2/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          scanId,
          conversationId: convId,
          message: msg,
        }),
      });

      const data = await res.json();

      if (res.status === 402 && data.error === "paywall") {
        setPaywalled(true);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || "Failed to get response");

      if (data.conversationId && !convId) {
        setConvId(data.conversationId);
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
      };

      // If it was auto-greeting, just show the assistant's response
      if (text) {
        setMessages([assistantMsg]);
      } else {
        setMessages(prev => [...prev, assistantMsg]);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const trackToolClick = async (toolName: string, url: string) => {
    try {
      await fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, toolName, affiliateUrl: url, source: "chat" }),
      });
    } catch (e) { /* silent */ }
  };

  const handleCheckout = async (plan: "report" | "advisor") => {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/v2/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, scanId }),
      });
      const data = await res.json();
      if (data.url) {
        typeof window !== "undefined" && window.location.href = data.url;
      } else {
        setError("Failed to create checkout session");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCheckingOut(false);
    }
  };

  // ─── Render a message with tool cards ─────────────────────────────────────
  function renderMessageContent(content: string) {
    const { segments } = parseToolCards(content);

    return segments.map((seg, i) => {
      if (seg.type === "card" && seg.card) {
        return (
          <ToolCard
            key={i}
            card={seg.card}
            userId={userId}
            onTrackClick={(toolName, url) => { trackToolClick(toolName, url); }}
          />
        );
      }
      // Text segment — render with basic formatting
      return (
        <div key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
          {seg.content.split("\n").map((line, li) => {
            // Bold text
            const parts = line.split(/(\*\*.*?\*\*)/g);
            return (
              <span key={li}>
                {parts.map((part, pi) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return <strong key={pi} className="font-bold text-white">{part.slice(2, -2)}</strong>;
                  }
                  return <span key={pi}>{part}</span>;
                })}
                {li < seg.content.split("\n").length - 1 && <br />}
              </span>
            );
          })}
        </div>
      );
    });
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0e17]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/10 bg-[#0d1320]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00c853]/20 flex items-center justify-center">
            <span className="text-sm">🧠</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white">AI Business Advisor</div>
            <div className="text-xs text-gray-400">
              {industryDisplay || "Business"} specialist
              {leakCount ? ` · ${leakCount} leaks found` : ""}
              {totalLeak ? ` · $${Math.round(totalLeak).toLocaleString()}/yr` : ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
          <span className="text-xs text-gray-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[#00c853]/15 border border-[#00c853]/20 text-gray-200"
                  : "bg-white/5 border border-white/10 text-gray-300"
              }`}
            >
              {msg.role === "assistant" ? (
                renderMessageContent(msg.content)
              ) : (
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-xs text-gray-500">Analyzing your data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Paywall */}
        {paywalled && (
          <div className="flex justify-center my-4">
            <div className="bg-gradient-to-b from-[#0d1320] to-[#111827] border border-[#00c853]/30 rounded-2xl px-6 py-6 max-w-md w-full text-center">
              <div className="text-3xl mb-3">🔒</div>
              <div className="text-lg font-bold text-white mb-1">You&apos;re finding real savings</div>
              <div className="text-sm text-gray-400 mb-5">
                Unlock your full fix plan with tool recommendations, priority actions, and unlimited Fruxal access.
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleCheckout("report")}
                  disabled={checkingOut}
                  className="w-full bg-[#00c853] text-black font-bold py-3 rounded-xl hover:bg-[#00e676] transition-colors disabled:opacity-50"
                >
                  {checkingOut ? "Redirecting..." : "Get Full Report — $47 CAD"}
                </button>
                <button
                  onClick={() => handleCheckout("advisor")}
                  disabled={checkingOut}
                  className="w-full bg-white/5 border border-[#00c853]/30 text-[#00c853] font-bold py-3 rounded-xl hover:bg-[#00c853]/10 transition-colors disabled:opacity-50"
                >
                  {checkingOut ? "Redirecting..." : "AI Advisor — $79/mo CAD"}
                </button>
                <div className="text-[10px] text-gray-600 mt-2">
                  One-time report includes all leaks + fixes. Monthly advisor adds unlimited AI chat + re-scans.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 text-xs text-red-400">
              {error}. <button onClick={() => setError(null)} className="underline">Dismiss</button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#0d1320]">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={paywalled ? "Unlock to continue chatting..." : "Ask about your leaks, fixes, or tools..."}
            rows={1}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none focus:border-[#00c853]/50 transition-colors"
            style={{ maxHeight: "120px" }}
            disabled={loading || paywalled}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading || paywalled}
            className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${
              input.trim() && !loading
                ? "bg-[#00c853] text-black hover:bg-[#00e676]"
                : "bg-white/5 text-gray-600 cursor-not-allowed"
            }`}
          >
            Send
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-600">
            AI responses are based on industry benchmarks. Connect QuickBooks for exact numbers.
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
