// =============================================================================
// TOOL CARD — Clickable affiliate recommendation inside AI chat
// =============================================================================
// Renders [TOOL_CARD]...[/TOOL_CARD] blocks from AI responses as rich cards.
// Two styles: "switch" (save money by switching) and "fix" (tool to fix a leak).
// Clicking tracks the click and opens the affiliate link.
// =============================================================================

"use client";

import { useState } from "react";

interface ToolCardData {
  name: string;
  category: string;
  price: string;
  savings: string;
  pros: string;
  cons: string;
  link: string;
}

// Parse [TOOL_CARD]...[/TOOL_CARD] blocks from AI text
export function parseToolCards(text: string): { segments: Array<{ type: "text" | "card"; content: string; card?: ToolCardData }> } {
  const segments: Array<{ type: "text" | "card"; content: string; card?: ToolCardData }> = [];
  const regex = /\[TOOL_CARD\]([\s\S]*?)\[\/TOOL_CARD\]/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Text before the card
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    // Parse card fields
    const cardText = match[1];
    const card: any = {};
    const lines = cardText.split("\n").map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const val = line.slice(colonIdx + 1).trim();
        card[key] = val;
      }
    }

    segments.push({
      type: "card",
      content: match[0],
      card: {
        name: card.name || "Recommended Tool",
        category: card.category || "",
        price: card.price || "",
        savings: card.savings || "",
        pros: card.pros || "",
        cons: card.cons || "",
        link: card.link || "#",
      },
    });

    lastIndex = match.index + match[0].length;
  }

  // Remaining text
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  // If no cards found, return whole text as single segment
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return { segments };
}

// ─── The Card Component ──────────────────────────────────────────────────────
export function ToolCard({
  card,
  userId,
  onTrackClick,
}: {
  card: ToolCardData;
  userId?: string;
  onTrackClick?: (toolName: string, url: string) => void;
}) {
  const [clicked, setClicked] = useState(false);
  const hasSavings = card.savings && card.savings !== "$0" && card.savings !== "";
  const isSwitch = hasSavings;

  const handleClick = async () => {
    setClicked(true);
    
    // Track the click
    if (onTrackClick) {
      onTrackClick(card.name, card.link);
    }

    // Also fire to tracking API
    try {
      await fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          toolName: card.name,
          affiliateUrl: card.link,
          source: "chat",
        }),
      });
    } catch (e) {
      // Don't block navigation on tracking failure
    }

    // Open affiliate link
    typeof window !== "undefined" && window.open(card.link, "_blank", "noopener");
  };

  const prosArr = card.pros ? card.pros.split(",").map(p => p.trim()).filter(Boolean) : [];
  const consArr = card.cons ? card.cons.split(",").map(c => c.trim()).filter(Boolean) : [];

  return (
    <div className={`my-3 rounded-xl border overflow-hidden ${
      isSwitch
        ? "border-emerald-500/30 bg-emerald-500/5"
        : "border-blue-500/30 bg-blue-500/5"
    }`}>
      {/* Header */}
      <div className={`px-4 py-2 text-xs font-bold tracking-wider ${
        isSwitch
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-blue-500/15 text-blue-400"
      }`}>
        {isSwitch ? "🔄 SWITCH & SAVE" : "🔧 FIX THIS LEAK"}
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-bold text-white text-sm">{card.name}</div>
            {card.category && (
              <div className="text-xs text-gray-400">{card.category}</div>
            )}
          </div>
          {card.price && (
            <div className="text-xs text-gray-300 font-medium whitespace-nowrap">
              {card.price}
            </div>
          )}
        </div>

        {hasSavings && (
          <div className="text-emerald-400 font-bold text-sm">
            YOU SAVE: {card.savings}
          </div>
        )}

        {/* Pros */}
        {prosArr.length > 0 && (
          <div className="space-y-1">
            {prosArr.map((p, i) => (
              <div key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                <span className="text-emerald-400 mt-0.5">✓</span>
                <span>{p}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cons */}
        {consArr.length > 0 && (
          <div className="space-y-1">
            {consArr.map((c, i) => (
              <div key={i} className="text-xs text-gray-400 flex items-start gap-1.5">
                <span className="text-gray-500 mt-0.5">✗</span>
                <span>{c}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleClick}
          className={`w-full mt-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
            clicked
              ? "bg-gray-700 text-gray-400 cursor-default"
              : isSwitch
                ? "bg-emerald-500 hover:bg-emerald-400 text-black"
                : "bg-blue-500 hover:bg-blue-400 text-white"
          }`}
          disabled={clicked}
        >
          {clicked ? "✓ Opened" : `See ${card.name} →`}
        </button>
      </div>
    </div>
  );
}

export default ToolCard;
