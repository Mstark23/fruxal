"use client";

import AppShell from "@/components/AppShell";

import { useState } from "react";

export default function PersonalPage() {
  const [scanned, setScanned] = useState(false);

  const personalLeaks = [
    { icon: "🏦", title: "Car insurance too expensive", amount: 840, fix: "Compare on Sonnet", detail: "You pay $2,400/yr. Average: $1,560.", partner: "Sonnet" },
    { icon: "📱", title: "Phone plan has better options", amount: 480, fix: "Switch to Fizz", detail: "$85/mo for 15GB. Fizz: $45/mo for 20GB.", partner: "Fizz" },
    { icon: "💳", title: "3 unused subscriptions", amount: 420, fix: "Cancel them", detail: "Audible, Headspace, Adobe. Not used in 90+ days.", partner: null },
    { icon: "🏠", title: "Home insurance too high", amount: 360, fix: "Compare quotes", detail: "You pay $1,800/yr. Market: $1,380-$1,500.", partner: "Kanetix" },
    { icon: "💰", title: "Bank fees too high", amount: 240, fix: "Switch to Wealthsimple", detail: "$20/mo fees. Free accounts exist.", partner: "Wealthsimple" },
  ];

  const total = personalLeaks.reduce((s, l) => s + l.amount, 0);

  return (
    <AppShell>
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-black">💧 LEAK &amp; GROW</span>
          <span className="text-[10px] font-bold bg-[#7c4dff] text-white px-2 py-0.5 rounded-full">PERSONAL · FREE</span>
        </div>
        <a href="/" className="text-xs text-gray-400 hover:text-gray-600">For Business →</a>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        {!scanned ? (
          /* Pre-scan */
          <div className="text-center">
            <div className="text-5xl mb-4">💧</div>
            <h1 className="text-3xl font-black mb-2">You are losing money and do not know it.</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Connect your bank. We find subscriptions you forgot, bills you overpay, and money you can get back.
            </p>
            <button onClick={() => setScanned(true)}
              className="w-full bg-[#00c853] text-white font-extrabold text-lg py-4 rounded-2xl hover:bg-[#00e676] transition-all">
              Find My Savings →
            </button>
            <p className="text-xs text-gray-400 mt-3">100% free. Always. We make money when you save money.</p>
          </div>
        ) : (
          /* Results */
          <div>
            <div className="text-center mb-6">
              <div className="text-xs text-gray-400">You could save</div>
              <div className="text-5xl font-black text-[#00c853]">${total.toLocaleString()}</div>
              <div className="text-sm text-gray-400">per year</div>
            </div>

            <div className="flex flex-col gap-3">
              {personalLeaks.map(l => (
                <div key={l.title} className="bg-white rounded-2xl p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold">{l.icon} {l.title}</span>
                    <span className="text-base font-extrabold text-[#00c853]">${l.amount}/yr</span>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">{l.detail}</div>
                  <button className="w-full bg-[#00c853] text-white font-bold py-2.5 rounded-xl text-sm hover:bg-[#00e676] transition-all">
                    {l.fix} →
                  </button>
                </div>
              ))}
            </div>

            {/* Share card */}
            <div className="mt-6 bg-[#0d1117] rounded-2xl p-5 text-center text-white">
              <div className="text-sm text-gray-400">Share with friends</div>
              <div className="text-2xl font-black text-[#00c853] my-2">I just found ${total.toLocaleString()}/yr I was wasting</div>
              <button className="w-full bg-[#00c853] text-black font-bold py-3 rounded-xl mt-3 hover:bg-[#00e676] transition-all">
                Share →
              </button>
            </div>

            {/* Business upsell */}
            <div className="mt-4 bg-[#f3eeff] rounded-2xl p-4 border border-[#7c4dff22] text-center">
              <div className="text-sm font-bold mb-1">Own a business?</div>
              <div className="text-xs text-gray-500 mb-3">We find 10-50x more savings for businesses. Starting at $99/mo.</div>
              <a href="/scan" className="text-xs font-bold text-[#7c4dff]">Scan My Business →</a>
            </div>
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}
