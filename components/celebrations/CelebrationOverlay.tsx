// =============================================================================
// src/components/celebrations/CelebrationOverlay.tsx
// =============================================================================
// Full-screen celebration triggered when user completes a significant action:
//   • Completes an obligation → confetti burst + score bump
//   • Fixes a leak → money rain + savings counter increment
//   • Unlocks a milestone → achievement card + particles
//
// Usage:
//   <CelebrationOverlay
//     type="obligation_complete" | "leak_fixed" | "milestone" | "score_up"
//     data={{ title, savings, oldScore, newScore, milestone }}
//     onDone={() => setCelebrating(false)}
//   />
// =============================================================================

"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CelebrationProps {
  type: "obligation_complete" | "leak_fixed" | "milestone" | "score_up";
  data: {
    title?: string;
    savings?: number;
    oldScore?: number;
    newScore?: number;
    milestone?: { icon: string; label: string; description: string };
    category?: string;
  };
  onDone: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: "circle" | "rect" | "dollar";
}

// ═══════════════════════════════════════════════════════════════════════════════

export default function CelebrationOverlay({ type, data, onDone }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const [phase, setPhase] = useState(0); // 0=particles, 1=content, 2=fadeout
  const [animatedSavings, setAnimatedSavings] = useState(0);
  const [animatedScore, setAnimatedScore] = useState(data.oldScore ?? 0);

  // ─── Particle colors by type ───────────────────────────────────
  const colors = type === "leak_fixed"
    ? ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#fbbf24", "#f59e0b"]
    : type === "obligation_complete"
    ? ["#3b82f6", "#60a5fa", "#93c5fd", "#10b981", "#fbbf24", "#f59e0b"]
    : type === "milestone"
    ? ["#f59e0b", "#fbbf24", "#fde68a", "#10b981", "#8b5cf6", "#a78bfa"]
    : ["#10b981", "#34d399", "#3b82f6", "#60a5fa", "#f59e0b"];

  // ─── Spawn particles ───────────────────────────────────────────
  const spawnParticles = useCallback(() => {
    const count = type === "milestone" ? 80 : 50;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400;
      const centerY = window.innerHeight * 0.35;
      const angle = (Math.random() * Math.PI * 2);
      const speed = 2 + Math.random() * 6;

      particles.push({
        id: i,
        x: centerX + (Math.random() - 0.5) * 40,
        y: centerY + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
        shape: type === "leak_fixed" && Math.random() > 0.7 ? "dollar" :
               Math.random() > 0.5 ? "rect" : "circle",
      });
    }
    particlesRef.current = particles;
  }, [type, colors]);

  // ─── Animate particles ─────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    spawnParticles();

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.vx *= 0.99; // drag
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity <= 0) return;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);

        if (p.shape === "dollar") {
          ctx.font = `${p.size * 2}px sans-serif`;
          ctx.fillText("$", -p.size / 2, p.size / 2);
        } else if (p.shape === "rect") {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // Remove dead particles
      particlesRef.current = particlesRef.current.filter(p => p.opacity > 0);

      if (particlesRef.current.length > 0) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [spawnParticles]);

  // ─── Phase timing ──────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 3500);
    const t3 = setTimeout(() => onDone(), 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  // ─── Animated savings counter ──────────────────────────────────
  useEffect(() => {
    if (phase < 1 || !data.savings) return;
    const target = data.savings;
    const duration = 1500;
    const steps = 40;
    let current = 0;
    const interval = setInterval(() => {
      current += target / steps;
      if (current >= target) {
        setAnimatedSavings(target);
        clearInterval(interval);
      } else {
        setAnimatedSavings(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [phase, data.savings]);

  // ─── Animated score ────────────────────────────────────────────
  useEffect(() => {
    if (phase < 1 || !data.newScore) return;
    const start = data.oldScore ?? 0;
    const target = data.newScore;
    const duration = 1200;
    const steps = 30;
    let current = start;
    const increment = (target - start) / steps;
    const interval = setInterval(() => {
      current += increment;
      if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
        setAnimatedScore(target);
        clearInterval(interval);
      } else {
        setAnimatedScore(Math.round(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [phase, data.oldScore, data.newScore]);

  // ─── Render ────────────────────────────────────────────────────
  return (
    <div className={`fixed inset-0 z-[9999] pointer-events-none transition-opacity duration-700 ${phase >= 2 ? "opacity-0" : "opacity-100"}`}>
      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Content overlay */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${phase >= 1 ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
        <div className="text-center px-6">

          {/* ═══ OBLIGATION COMPLETE ═══ */}
          {type === "obligation_complete" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-blue-500/15 flex items-center justify-center text-3xl mx-auto mb-3 animate-bounce">
                ✓
              </div>
              <h2 className="text-white/80 text-lg font-bold mb-1">Obligation Complete!</h2>
              <p className="text-white/30 text-xs mb-3">{data.title}</p>
              {data.newScore && data.oldScore && (
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/15 rounded-xl px-4 py-2">
                  <span className="text-white/30 text-sm">{data.oldScore}</span>
                  <span className="text-emerald-400 text-sm">→</span>
                  <span className="text-emerald-400 text-xl font-black">{animatedScore}</span>
                  <span className="text-emerald-400/50 text-xs">+{(data.newScore - data.oldScore)}</span>
                </div>
              )}
            </>
          )}

          {/* ═══ LEAK FIXED ═══ */}
          {type === "leak_fixed" && (
            <>
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-3xl mx-auto mb-3" style={{ animation: "popIn 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)" }}>
                💰
              </div>
              <h2 className="text-white/80 text-lg font-bold mb-1">Leak Fixed!</h2>
              <p className="text-white/30 text-xs mb-3">{data.title}</p>
              {data.savings && data.savings > 0 && (
                <div className="inline-block bg-emerald-500/10 border border-emerald-500/15 rounded-xl px-5 py-3">
                  <p className="text-emerald-400/40 text-[9px] uppercase tracking-wider">You're Saving</p>
                  <p className="text-emerald-400 text-2xl font-black">
                    +${(Number(animatedSavings) || 0).toLocaleString()}<span className="text-sm font-normal text-emerald-400/50">/yr</span>
                  </p>
                </div>
              )}
            </>
          )}

          {/* ═══ MILESTONE ═══ */}
          {type === "milestone" && data.milestone && (
            <>
              <div className="w-20 h-20 rounded-2xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-4xl mx-auto mb-3" style={{ animation: "popIn 0.5s cubic-bezier(0.68,-0.55,0.27,1.55)" }}>
                {data.milestone.icon}
              </div>
              <h2 className="text-amber-400 text-lg font-bold mb-1">{data.milestone.label}</h2>
              <p className="text-white/30 text-xs">{data.milestone.description}</p>
            </>
          )}

          {/* ═══ SCORE UP ═══ */}
          {type === "score_up" && data.newScore && data.oldScore && (
            <>
              <div className="relative w-28 h-28 mx-auto mb-3">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={animatedScore >= 70 ? "#10b981" : animatedScore >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(animatedScore / 100) * 264} 264`}
                    className="transition-all duration-300" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-black ${animatedScore >= 70 ? "text-emerald-400" : animatedScore >= 40 ? "text-amber-400" : "text-red-400"}`}>
                    {animatedScore}
                  </span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-emerald-400 text-sm font-bold">
                <span>↑ +{data.newScore - data.oldScore} points</span>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes popIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
