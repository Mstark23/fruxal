"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiChatWidgetProps {
  position?: "inline" | "floating";
}

// Render confidence badges inline
function renderContent(text: string) {
  if (!text) return null;
  const badges: Record<string, { label: string; bg: string; color: string }> = {
    "[DATA:actual]": { label: "From your documents", bg: "rgba(45,122,80,0.1)", color: "#2D7A50" },
    "[DATA:scan]": { label: "Prescan estimate", bg: "rgba(196,132,29,0.1)", color: "#C4841D" },
    "[DATA:industry]": { label: "Industry benchmark", bg: "rgba(3,105,161,0.1)", color: "#0369a1" },
  };
  const parts = text.split(/(\[DATA:(?:actual|scan|industry)\])/g);
  return parts.map((part, i) => {
    const badge = badges[part];
    if (badge) {
      return <span key={i} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold mx-0.5 align-middle" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function AiChatWidget({ position = "inline" }: AiChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [starters, setStarters] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [repName, setRepName] = useState<string | null>(null);
  const [calendlyUrl, setCalendlyUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(position === "inline");
  const [loaded, setLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load starters + chat history on mount
  useEffect(() => {
    fetch("/api/v2/ai-assistant/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ getStarters: true }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.starters) setStarters(d.starters);
        if (d.repName) setRepName(d.repName);
        if (d.calendlyUrl) setCalendlyUrl(d.calendlyUrl);
      })
      .catch(() => {});

    // Load previous messages
    fetch("/api/v2/chat?loadHistory=1")
      .then(r => r.json())
      .then(d => {
        if (d.messages?.length) setMessages(d.messages.slice(-10));
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg = text.trim();
    setInput("");
    setSuggestions([]);
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setStreaming(true);

    // Add placeholder for streaming
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/v2/ai-assistant/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-8),
        }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

          for (const line of lines) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.text) {
                fullText += data.text;
                // Remove suggestion tags from display
                const cleanDisplay = fullText.replace(/\[SUGGEST\].*?\[\/SUGGEST\]/g, "").trim();
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: cleanDisplay };
                  return updated;
                });
              }

              if (data.done) {
                if (data.suggestions?.length) setSuggestions(data.suggestions);
                if (data.repName) setRepName(data.repName);
                if (data.calendlyUrl) setCalendlyUrl(data.calendlyUrl);
              }

              if (data.error) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: "Something went wrong. Please try again." };
                  return updated;
                });
              }
            } catch { /* skip malformed chunks */ }
          }
        }
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Connection error. Please try again." };
        return updated;
      });
    }

    setStreaming(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [messages, streaming]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setUploading(true);
    setMessages(prev => [...prev, { role: "user", content: `Uploaded: ${file.name}` }]);
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", file.name.toLowerCase().includes("t2") || file.name.toLowerCase().includes("1120") ? "t2"
        : file.name.toLowerCase().includes("bank") ? "bank_statement"
        : file.name.toLowerCase().includes("insurance") ? "insurance"
        : "financials");

      const res = await fetch("/api/v2/document-intelligence", { method: "POST", body: formData });
      const j = await res.json();

      let response = "";
      if (j.success) {
        const insights = j.insights || [];
        response = `I've analyzed ${file.name}. `;
        if (j.profileUpdated?.length > 0) response += `Updated your profile with: ${j.profileUpdated.join(", ")}. `;
        if (insights.length > 0) response += insights.join(" ");
        if (insights.length === 0) response += "Everything looks consistent with your current data.";
        response += " Your rep will use this for more accurate recovery.";
      } else {
        response = "I couldn't analyze that file. Try uploading a PDF of your T2, financial statements, or bank statement.";
      }

      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: response };
        return updated;
      });
      setSuggestions(["What did you find in my documents?", "Are there new deductions I'm missing?", "What should my rep focus on next?"]);
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Upload failed. Please try again with a PDF, JPG, or PNG file." };
        return updated;
      });
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }, [uploading]);

  // Floating button (when position = "floating")
  if (position === "floating" && !isOpen) {
    return (
      <button onClick={() => setIsOpen(true)}
        className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-50 w-14 h-14 rounded-full bg-[#1B3A2D] flex items-center justify-center shadow-xl hover:bg-[#2A5A44] transition-all hover:scale-105"
        style={{ boxShadow: "0 4px 20px rgba(27,58,45,0.3)" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>
    );
  }

  return (
    <div className={position === "floating" ? "fixed bottom-0 right-0 lg:bottom-6 lg:right-6 z-50 w-full lg:w-[380px] h-[85vh] lg:h-[520px] flex flex-col" : "flex flex-col h-full"}>
      <div className="bg-white border border-[#E5E3DD] rounded-2xl overflow-hidden flex flex-col h-full"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>

        {/* Header */}
        <div className="px-4 py-3 border-b border-[#E5E3DD] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1B3A2D] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1A1A18]">Fruxal AI</p>
              <p className="text-[10px] text-[#8E8C85]">
                {repName ? `Your rep: ${repName}` : "Ask me anything about your business"}
              </p>
            </div>
          </div>
          {position === "floating" && (
            <button onClick={() => setIsOpen(false)} className="text-[#B5B3AD] hover:text-[#1A1A18] transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-[#FAFAF8]">
          {/* Empty state with starters */}
          {messages.length === 0 && loaded && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-[#1B3A2D]/8 flex items-center justify-center mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B3A2D" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-[#1A1A18] mb-1">How can I help?</p>
              <p className="text-[12px] text-[#8E8C85] mb-5">I know your business data. Ask me anything.</p>
              <div className="space-y-2 w-full">
                {starters.slice(0, 4).map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    className="w-full text-left px-3.5 py-2.5 text-[12px] text-[#56554F] bg-white border border-[#E5E3DD] rounded-xl hover:border-[#1B3A2D]/30 hover:bg-[#F0FBF5] transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                m.role === "user"
                  ? "bg-[#1B3A2D] text-white rounded-br-md"
                  : "bg-white border border-[#E5E3DD] text-[#1A1A18] rounded-bl-md"
              }`} style={{ boxShadow: m.role === "assistant" ? "0 1px 2px rgba(0,0,0,0.03)" : "none" }}>
                {m.content ? (
                  m.role === "assistant" ? renderContent(m.content) : m.content
                ) : (
                  <span className="flex items-center gap-1.5 text-[#8E8C85]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E8C85] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E8C85] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8E8C85] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                )}
              </div>
            </div>
          ))}

          {/* Suggested follow-ups */}
          {suggestions.length > 0 && !streaming && (
            <div className="space-y-1.5 pt-1">
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)}
                  className="w-full text-left px-3 py-2 text-[11px] text-[#56554F] bg-white border border-[#E5E3DD] rounded-xl hover:border-[#1B3A2D]/30 hover:bg-[#F0FBF5] transition-all">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Action buttons after relevant messages */}
          {calendlyUrl && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content?.toLowerCase().includes("rep") && !streaming && (
            <div className="flex gap-2 pt-1">
              <a href={calendlyUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-[#1B3A2D] rounded-lg hover:bg-[#2A5A44] transition">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /></svg>
                Book a Call
              </a>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-[#E5E3DD] bg-white shrink-0">
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={handleFileUpload} />
          <div className="flex items-center gap-2 bg-[#FAFAF8] border border-[#E5E3DD] rounded-xl pl-1.5 pr-1.5 py-0.5 focus-within:border-[#1B3A2D] focus-within:ring-2 focus-within:ring-[#1B3A2D]/10 transition-all">
            <button onClick={() => fileRef.current?.click()} disabled={streaming || uploading}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#E5E3DD] transition disabled:opacity-30 shrink-0" title="Upload document">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8E8C85" strokeWidth="2" strokeLinecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" /></svg>
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              placeholder={uploading ? "Analyzing document..." : "Ask about your leaks, recovery, programs..."}
              disabled={streaming || uploading}
              className="flex-1 py-2 text-[13px] text-[#1A1A18] bg-transparent border-none outline-none placeholder:text-[#B5B3AD] disabled:opacity-50"
            />
            <button onClick={() => sendMessage(input)} disabled={streaming || uploading || !input.trim()}
              className="w-8 h-8 rounded-lg bg-[#1B3A2D] flex items-center justify-center hover:bg-[#2A5A44] transition disabled:opacity-30 shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </button>
          </div>
          <p className="text-[9px] text-[#B5B3AD] text-center mt-1.5">AI advisor with your real business data</p>
        </div>
      </div>
    </div>
  );
}
