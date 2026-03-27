"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════════════════
// All 205 industries — must match onboarding/page.tsx
// ═══════════════════════════════════════════════════════════════════════════════
const ALL_INDUSTRIES: { id: string; name: string; tier: string }[] = [
  // Solo Entrepreneur (49)
  {id:"acupuncturist",name:"Acupuncturist",tier:"solo-entrepreneur"},
  {id:"naturopath",name:"Naturopathic Doctor",tier:"solo-entrepreneur"},
  {id:"dietitian",name:"Dietitian / Nutritionist",tier:"solo-entrepreneur"},
  {id:"occupational-therapist",name:"Occupational Therapist",tier:"solo-entrepreneur"},
  {id:"speech-pathologist",name:"Speech-Language Pathologist",tier:"solo-entrepreneur"},
  {id:"midwife-doula",name:"Midwife / Doula",tier:"solo-entrepreneur"},
  {id:"osteopath",name:"Osteopath",tier:"solo-entrepreneur"},
  {id:"kinesiologist",name:"Kinesiologist",tier:"solo-entrepreneur"},
  {id:"podiatrist",name:"Podiatrist / Chiropodist",tier:"solo-entrepreneur"},
  {id:"welder",name:"Welder",tier:"solo-entrepreneur"},
  {id:"carpenter",name:"Carpenter",tier:"solo-entrepreneur"},
  {id:"tiler-flooring",name:"Tiler / Flooring",tier:"solo-entrepreneur"},
  {id:"mason-bricklayer",name:"Mason / Bricklayer",tier:"solo-entrepreneur"},
  {id:"drywall-plasterer",name:"Drywall / Plasterer",tier:"solo-entrepreneur"},
  {id:"fencer",name:"Fence Installer",tier:"solo-entrepreneur"},
  {id:"pool-service",name:"Pool Service",tier:"solo-entrepreneur"},
  {id:"arborist",name:"Arborist / Tree Service",tier:"solo-entrepreneur"},
  {id:"owner-operator-trucker",name:"Owner-Operator Trucker",tier:"solo-entrepreneur"},
  {id:"gig-delivery",name:"Gig Delivery Driver",tier:"solo-entrepreneur"},
  {id:"hotshot-expedite",name:"Hotshot / Expedite",tier:"solo-entrepreneur"},
  {id:"copywriter",name:"Copywriter / Writer",tier:"solo-entrepreneur"},
  {id:"videographer",name:"Videographer",tier:"solo-entrepreneur"},
  {id:"podcaster",name:"Podcaster",tier:"solo-entrepreneur"},
  {id:"musician-dj",name:"Musician / DJ",tier:"solo-entrepreneur"},
  {id:"voice-actor",name:"Voice Actor",tier:"solo-entrepreneur"},
  {id:"social-media-manager",name:"Social Media Manager",tier:"solo-entrepreneur"},
  {id:"ux-designer",name:"UX/UI Designer",tier:"solo-entrepreneur"},
  {id:"animator",name:"Animator / Motion",tier:"solo-entrepreneur"},
  {id:"hairstylist-solo",name:"Hairstylist (Booth Renter)",tier:"solo-entrepreneur"},
  {id:"esthetician",name:"Esthetician",tier:"solo-entrepreneur"},
  {id:"makeup-artist",name:"Makeup Artist",tier:"solo-entrepreneur"},
  {id:"lash-brow-tech",name:"Lash & Brow Tech",tier:"solo-entrepreneur"},
  {id:"personal-trainer",name:"Personal Trainer",tier:"solo-entrepreneur"},
  {id:"yoga-instructor",name:"Yoga Instructor",tier:"solo-entrepreneur"},
  {id:"pilates-instructor",name:"Pilates Instructor",tier:"solo-entrepreneur"},
  {id:"sports-coach",name:"Sports Coach",tier:"solo-entrepreneur"},
  {id:"travel-agent",name:"Travel Agent",tier:"solo-entrepreneur"},
  {id:"direct-sales",name:"Direct Sales / MLM",tier:"solo-entrepreneur"},
  {id:"pet-care",name:"Pet Care / Dog Walker",tier:"solo-entrepreneur"},
  {id:"house-cleaner-solo",name:"House Cleaner",tier:"solo-entrepreneur"},
  {id:"virtual-assistant",name:"Virtual Assistant",tier:"solo-entrepreneur"},
  {id:"personal-chef",name:"Personal Chef",tier:"solo-entrepreneur"},
  {id:"handyman",name:"Handyman",tier:"solo-entrepreneur"},
  {id:"mobile-mechanic",name:"Mobile Mechanic",tier:"solo-entrepreneur"},
  {id:"snow-removal-solo",name:"Snow Removal",tier:"solo-entrepreneur"},
  {id:"bookkeeper-solo",name:"Bookkeeper",tier:"solo-entrepreneur"},
  {id:"notary",name:"Notary",tier:"solo-entrepreneur"},
  {id:"appraiser",name:"Appraiser",tier:"solo-entrepreneur"},
  {id:"private-investigator",name:"Private Investigator",tier:"solo-entrepreneur"},
  // Mid-Size Business (124)
  {id:"restaurant",name:"Restaurant",tier:"mid-size-business"},{id:"bar-nightclub",name:"Bar & Nightclub",tier:"mid-size-business"},
  {id:"cafe-coffee-shop",name:"Café & Coffee Shop",tier:"mid-size-business"},{id:"bakery",name:"Bakery",tier:"mid-size-business"},
  {id:"catering",name:"Catering",tier:"mid-size-business"},{id:"food-truck",name:"Food Truck",tier:"mid-size-business"},
  {id:"food-delivery",name:"Food Delivery",tier:"mid-size-business"},
  {id:"retail",name:"Retail Store",tier:"mid-size-business"},{id:"ecommerce",name:"E-Commerce",tier:"mid-size-business"},
  {id:"grocery",name:"Grocery Store",tier:"mid-size-business"},{id:"convenience-store",name:"Convenience Store",tier:"mid-size-business"},
  {id:"clothing-boutique",name:"Clothing Boutique",tier:"mid-size-business"},{id:"furniture-store",name:"Furniture Store",tier:"mid-size-business"},
  {id:"jewelry-store",name:"Jewelry Store",tier:"mid-size-business"},{id:"pet-store",name:"Pet Store",tier:"mid-size-business"},
  {id:"hardware-store",name:"Hardware Store",tier:"mid-size-business"},{id:"liquor-store",name:"Liquor Store",tier:"mid-size-business"},
  {id:"florist",name:"Florist",tier:"mid-size-business"},{id:"bookstore",name:"Bookstore",tier:"mid-size-business"},
  {id:"sporting-goods",name:"Sporting Goods",tier:"mid-size-business"},{id:"vape-smoke-shop",name:"Vape & Smoke Shop",tier:"mid-size-business"},
  {id:"auto-parts",name:"Auto Parts",tier:"mid-size-business"},{id:"cannabis-retail",name:"Cannabis Retail",tier:"mid-size-business"},
  {id:"subscription-box",name:"Subscription Box",tier:"mid-size-business"},
  {id:"healthcare",name:"Healthcare",tier:"mid-size-business"},{id:"dental",name:"Dental Practice",tier:"mid-size-business"},
  {id:"chiropractic",name:"Chiropractic",tier:"mid-size-business"},{id:"optometry",name:"Optometry",tier:"mid-size-business"},
  {id:"physiotherapy",name:"Physiotherapy",tier:"mid-size-business"},{id:"pharmacy",name:"Pharmacy",tier:"mid-size-business"},
  {id:"medical-spa",name:"Medical Spa",tier:"mid-size-business"},{id:"massage-therapy",name:"Massage Therapy",tier:"mid-size-business"},
  {id:"mental-health",name:"Mental Health",tier:"mid-size-business"},{id:"medical-lab",name:"Medical Lab",tier:"mid-size-business"},
  {id:"veterinary",name:"Veterinary",tier:"mid-size-business"},{id:"home-care",name:"Home Care",tier:"mid-size-business"},
  {id:"construction",name:"Construction",tier:"mid-size-business"},{id:"roofing",name:"Roofing",tier:"mid-size-business"},
  {id:"electrical",name:"Electrical",tier:"mid-size-business"},{id:"plumbing",name:"Plumbing",tier:"mid-size-business"},
  {id:"hvac",name:"HVAC",tier:"mid-size-business"},{id:"painting",name:"Painting",tier:"mid-size-business"},
  {id:"landscaping",name:"Landscaping",tier:"mid-size-business"},{id:"demolition",name:"Demolition",tier:"mid-size-business"},
  {id:"trades",name:"General Trades",tier:"mid-size-business"},{id:"solar-energy",name:"Solar Energy",tier:"mid-size-business"},
  {id:"accounting",name:"Accounting",tier:"mid-size-business"},{id:"law-firm",name:"Law Firm",tier:"mid-size-business"},
  {id:"consulting",name:"Consulting",tier:"mid-size-business"},{id:"architecture",name:"Architecture",tier:"mid-size-business"},
  {id:"engineering",name:"Engineering",tier:"mid-size-business"},{id:"financial-advisor",name:"Financial Advisor",tier:"mid-size-business"},
  {id:"insurance-broker",name:"Insurance Broker",tier:"mid-size-business"},{id:"mortgage-broker",name:"Mortgage Broker",tier:"mid-size-business"},
  {id:"bookkeeping",name:"Bookkeeping",tier:"mid-size-business"},{id:"tax-preparation",name:"Tax Preparation",tier:"mid-size-business"},
  {id:"hr-consulting",name:"HR Consulting",tier:"mid-size-business"},{id:"marketing-consultant",name:"Marketing Consultant",tier:"mid-size-business"},
  {id:"environmental-consulting",name:"Environmental",tier:"mid-size-business"},{id:"surveying",name:"Surveying",tier:"mid-size-business"},
  {id:"saas",name:"SaaS / Software",tier:"mid-size-business"},{id:"web-development",name:"Web Development",tier:"mid-size-business"},
  {id:"app-development",name:"App Development",tier:"mid-size-business"},{id:"it-services",name:"IT Services",tier:"mid-size-business"},
  {id:"real-estate",name:"Real Estate",tier:"mid-size-business"},{id:"property-management",name:"Property Mgmt",tier:"mid-size-business"},
  {id:"home-inspection",name:"Home Inspection",tier:"mid-size-business"},{id:"home-staging",name:"Home Staging",tier:"mid-size-business"},
  {id:"auto-repair",name:"Auto Repair",tier:"mid-size-business"},{id:"auto-body",name:"Auto Body",tier:"mid-size-business"},
  {id:"auto-detailing",name:"Auto Detailing",tier:"mid-size-business"},{id:"tire-shop",name:"Tire Shop",tier:"mid-size-business"},
  {id:"car-wash",name:"Car Wash",tier:"mid-size-business"},
  {id:"beauty-salon",name:"Beauty Salon",tier:"mid-size-business"},{id:"barber-shop",name:"Barber Shop",tier:"mid-size-business"},
  {id:"nail-salon",name:"Nail Salon",tier:"mid-size-business"},{id:"spa",name:"Spa",tier:"mid-size-business"},
  {id:"tattoo-piercing",name:"Tattoo & Piercing",tier:"mid-size-business"},{id:"dry-cleaning",name:"Dry Cleaning",tier:"mid-size-business"},
  {id:"laundromat",name:"Laundromat",tier:"mid-size-business"},{id:"photography",name:"Photography",tier:"mid-size-business"},
  {id:"fitness",name:"Fitness Studio",tier:"mid-size-business"},{id:"gym-crossfit",name:"Gym & CrossFit",tier:"mid-size-business"},
  {id:"yoga-studio",name:"Yoga Studio",tier:"mid-size-business"},{id:"martial-arts",name:"Martial Arts",tier:"mid-size-business"},
  {id:"dance-studio",name:"Dance Studio",tier:"mid-size-business"},{id:"golf-course",name:"Golf Course",tier:"mid-size-business"},
  {id:"bowling-alley",name:"Bowling Alley",tier:"mid-size-business"},{id:"escape-room",name:"Escape Room",tier:"mid-size-business"},
  {id:"amusement-recreation",name:"Amusement & Rec",tier:"mid-size-business"},
  {id:"daycare",name:"Daycare",tier:"mid-size-business"},{id:"childcare-home",name:"Home Childcare",tier:"mid-size-business"},
  {id:"tutoring",name:"Tutoring",tier:"mid-size-business"},{id:"driving-school",name:"Driving School",tier:"mid-size-business"},
  {id:"music-school",name:"Music School",tier:"mid-size-business"},{id:"training-coaching",name:"Training & Coaching",tier:"mid-size-business"},
  {id:"bed-breakfast",name:"Bed & Breakfast",tier:"mid-size-business"},{id:"event-planning",name:"Event Planning",tier:"mid-size-business"},
  {id:"courier-delivery",name:"Courier & Delivery",tier:"mid-size-business"},{id:"taxi-rideshare",name:"Taxi & Rideshare",tier:"mid-size-business"},
  {id:"moving-company",name:"Moving Company",tier:"mid-size-business"},{id:"towing",name:"Towing",tier:"mid-size-business"},
  {id:"woodworking",name:"Woodworking",tier:"mid-size-business"},{id:"printing",name:"Printing",tier:"mid-size-business"},
  {id:"farming",name:"Farming",tier:"mid-size-business"},{id:"ranching",name:"Ranching",tier:"mid-size-business"},
  {id:"greenhouse-nursery",name:"Greenhouse & Nursery",tier:"mid-size-business"},
  {id:"agency",name:"Marketing Agency",tier:"mid-size-business"},{id:"graphic-design",name:"Graphic Design",tier:"mid-size-business"},
  {id:"interior-design",name:"Interior Design",tier:"mid-size-business"},{id:"translation",name:"Translation",tier:"mid-size-business"},
  {id:"influencer-creator",name:"Influencer & Creator",tier:"mid-size-business"},
  {id:"cleaning",name:"Cleaning Services",tier:"mid-size-business"},{id:"pest-control",name:"Pest Control",tier:"mid-size-business"},
  {id:"security-guard",name:"Security Services",tier:"mid-size-business"},{id:"janitorial-commercial",name:"Commercial Janitorial",tier:"mid-size-business"},
  {id:"locksmith",name:"Locksmith",tier:"mid-size-business"},{id:"appliance-repair",name:"Appliance Repair",tier:"mid-size-business"},
  {id:"computer-repair",name:"Computer Repair",tier:"mid-size-business"},{id:"phone-repair",name:"Phone Repair",tier:"mid-size-business"},
  {id:"upholstery",name:"Upholstery",tier:"mid-size-business"},
  {id:"nonprofit",name:"Nonprofit",tier:"mid-size-business"},{id:"church-religious",name:"Church & Religious",tier:"mid-size-business"},
  {id:"freelancer-gig",name:"Freelancer & Gig",tier:"mid-size-business"},
  // Growth Business (32)
  {id:"fast-food-franchise",name:"Fast Food Franchise",tier:"growth-business"},
  {id:"food-processing",name:"Food Processing",tier:"growth-business"},
  {id:"beverage-manufacturing",name:"Beverage Mfg",tier:"growth-business"},
  {id:"senior-care",name:"Senior Care",tier:"growth-business"},
  {id:"addiction-treatment",name:"Addiction Treatment",tier:"growth-business"},
  {id:"car-dealership",name:"Car Dealership",tier:"growth-business"},
  {id:"collections-agency",name:"Collections Agency",tier:"growth-business"},
  {id:"managed-service-provider",name:"MSP / IT Services",tier:"growth-business"},
  {id:"cybersecurity",name:"Cybersecurity",tier:"growth-business"},
  {id:"data-analytics",name:"Data Analytics",tier:"growth-business"},
  {id:"telecom",name:"Telecom",tier:"growth-business"},
  {id:"hotel-motel",name:"Hotel & Motel",tier:"growth-business"},
  {id:"private-school",name:"Private School",tier:"growth-business"},
  {id:"trucking",name:"Trucking Fleet",tier:"growth-business"},
  {id:"freight-broker",name:"Freight Broker",tier:"growth-business"},
  {id:"warehousing",name:"Warehousing",tier:"growth-business"},
  {id:"manufacturing",name:"Manufacturing",tier:"growth-business"},
  {id:"metal-fabrication",name:"Metal Fabrication",tier:"growth-business"},
  {id:"textile-apparel",name:"Textile & Apparel",tier:"growth-business"},
  {id:"plastics-rubber",name:"Plastics & Rubber",tier:"growth-business"},
  {id:"cannabis",name:"Cannabis Production",tier:"growth-business"},
  {id:"forestry-logging",name:"Forestry & Logging",tier:"growth-business"},
  {id:"fishing",name:"Commercial Fishing",tier:"growth-business"},
  {id:"mining",name:"Mining",tier:"growth-business"},
  {id:"oil-gas",name:"Oil & Gas",tier:"growth-business"},
  {id:"media-production",name:"Media Production",tier:"growth-business"},
  {id:"publishing",name:"Publishing",tier:"growth-business"},
  {id:"staffing-agency",name:"Staffing Agency",tier:"growth-business"},
  {id:"funeral-home",name:"Funeral Home",tier:"growth-business"},
  {id:"waste-management",name:"Waste Management",tier:"growth-business"},
  {id:"wholesale",name:"Wholesale Distribution",tier:"growth-business"},
  {id:"import-export",name:"Import / Export",tier:"growth-business"},
];

const TIER_LABELS: Record<string, { name: string; icon: string; color: string }> = {
  "solo-entrepreneur": { name: "Solo Entrepreneur", icon: "🧑‍💻", color: "text-emerald-600 bg-emerald-50" },
  "mid-size-business": { name: "Mid-Size Business", icon: "🏪", color: "text-blue-600 bg-blue-50" },
  "growth-business": { name: "Growth Business", icon: "🏢", color: "text-purple-600 bg-purple-50" },
};

export default function SettingsPage() {
  const router = useRouter();
  const [ctx, setCtx] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState("profile");
  const [form, setForm] = useState({ name: "", email: "", businessName: "", industry: "", tier: "" });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, push: true, weekly: true, leakAlerts: true });
  const [teamEmail, setTeamEmail] = useState("");
  const [indSearch, setIndSearch] = useState("");

  useEffect(() => {
    fetch("/api/me").then(r => r.json()).catch(() => ({})).then(d => {
      setCtx(d);
      setForm({
        name: d.user?.name || "",
        email: d.user?.email || "",
        businessName: d.business?.name || "",
        industry: d.business?.industry || "",
        tier: d.business?.tier || "mid-size-business",
      });
    }).catch(() => router.push("/login"));
  }, [router]);

  const save = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, notifPrefs, userId: ctx?.user?.id, businessId: ctx?.business?.id }),
      });
      setSaved(true);
      const _to = setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  if (!ctx) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-400">Loading...</div></div>;

  const plan = ctx.business?.plan || "free";
  const tierInfo = TIER_LABELS[form.tier] || TIER_LABELS["mid-size-business"];

  // Filter industries for dropdown — show all, but let user search
  const filteredIndustries = indSearch
    ? ALL_INDUSTRIES.filter(i => i.name.toLowerCase().includes(indSearch.toLowerCase()) || i.id.includes(indSearch.toLowerCase()))
    : ALL_INDUSTRIES;

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-[#1a1a2e]">⚙️ Settings</h1>
          <button onClick={() => router.push("/dashboard")} className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</button>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border">
          {[
            { key: "profile", label: "Profile" },
            { key: "notifications", label: "Notifications" },
            { key: "billing", label: "Billing" },
            { key: "team", label: "Team" },
          ].map(s => (
            <button key={s.key} onClick={() => setSection(s.key)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${section === s.key ? "bg-[#1a1a2e] text-white" : "text-gray-400 hover:text-gray-600"}`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Profile */}
        {section === "profile" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
            {/* Tier badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${tierInfo.color}`}>
                {tierInfo.icon} {tierInfo.name}
              </span>
              <span className="text-[10px] text-gray-300">Set during onboarding</span>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">YOUR NAME</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">EMAIL</label>
              <input value={form.email} disabled className="w-full px-3 py-2.5 border rounded-xl text-sm bg-gray-50 text-gray-400" />
              <p className="text-xs text-gray-300 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">BUSINESS NAME</label>
              <input value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 block mb-1">INDUSTRY</label>
              <input
                type="text"
                placeholder="Search 205 industries..."
                value={indSearch}
                onChange={e => setIndSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none mb-1"
              />
              <select
                value={form.industry}
                onChange={e => {
                  const newInd = e.target.value;
                  const match = ALL_INDUSTRIES.find(i => i.id === newInd);
                  setForm({...form, industry: newInd, tier: match?.tier || form.tier });
                }}
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                size={indSearch ? Math.min(filteredIndustries.length, 8) : 1}
              >
                {!indSearch && <option value="">Select industry...</option>}
                {indSearch ? (
                  filteredIndustries.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} — {TIER_LABELS[i.tier]?.icon || ""} {TIER_LABELS[i.tier]?.name || ""}
                    </option>
                  ))
                ) : (
                  <>
                    <optgroup label="🧑‍💻 Solo Entrepreneur">
                      {ALL_INDUSTRIES.filter(i => i.tier === "solo-entrepreneur").map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🏪 Mid-Size Business">
                      {ALL_INDUSTRIES.filter(i => i.tier === "mid-size-business").map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </optgroup>
                    <optgroup label="🏢 Growth Business">
                      {ALL_INDUSTRIES.filter(i => i.tier === "growth-business").map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </optgroup>
                  </>
                )}
              </select>
              {form.industry && (
                <p className="text-[11px] text-gray-400 mt-1">
                  Current: <strong>{ALL_INDUSTRIES.find(i => i.id === form.industry)?.name || form.industry}</strong>
                </p>
              )}
            </div>
            <button onClick={save} disabled={saving} className="w-full py-2.5 bg-[#1a1a2e] text-white font-bold rounded-xl text-sm hover:bg-[#2a2a3e] disabled:opacity-50 transition-all">
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>
        )}

        {/* Notifications */}
        {section === "notifications" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
            {[
              { key: "email", label: "Email notifications", desc: "Get notified about leaks and fixes via email" },
              { key: "push", label: "Push notifications", desc: "Browser push notifications for urgent leaks" },
              { key: "weekly", label: "Weekly digest", desc: "Monday summary of your fix list and progress" },
              { key: "leakAlerts", label: "Leak alerts", desc: "Instant alert when a metric worsens" },
            ].map(n => (
              <div key={n.key} className="flex items-center justify-between py-2">
                <div><div className="text-sm font-medium">{n.label}</div><div className="text-xs text-gray-400">{n.desc}</div></div>
                <button onClick={() => setNotifPrefs({...notifPrefs, [n.key]: !notifPrefs[n.key as keyof typeof notifPrefs]})}
                  className={`w-11 h-6 rounded-full transition-all relative ${notifPrefs[n.key as keyof typeof notifPrefs] ? "bg-[#00c853]" : "bg-gray-200"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-all`}
                    style={{ left: notifPrefs[n.key as keyof typeof notifPrefs] ? "22px" : "2px" }} />
                </button>
              </div>
            ))}
            <button onClick={save} disabled={saving} className="w-full py-2.5 bg-[#1a1a2e] text-white font-bold rounded-xl text-sm hover:bg-[#2a2a3e] disabled:opacity-50 transition-all">
              {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Preferences"}
            </button>
          </div>
        )}

        {/* Billing */}
        {section === "billing" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">Current Plan</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {plan === "free" ? "Free" : plan === "pro" ? "Recovery Engagement" : "Active"}
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${plan === "free" ? "bg-gray-100 text-gray-400" : "bg-green-50 text-green-600"}`}>
                {plan.toUpperCase()}
              </span>
            </div>
            {plan === "free" ? (
              <div className="bg-[#F0FBF5] rounded-xl p-4 border border-[#1B3A2D]/10">
                <div className="text-sm font-bold text-[#1B3A2D] mb-1">Recovery service — 12% contingency</div>
                <div className="text-xs text-gray-500 mb-3">
                  All tools are free. If your diagnostic qualifies you for a recovery engagement,
                  a rep is assigned at no upfront cost. We take 12% of confirmed savings only.
                </div>
                <a href="/" className="inline-block px-4 py-2 bg-[#1B3A2D] text-white font-bold rounded-lg text-sm hover:opacity-90 transition">
                  Run a free scan →
                </a>
              </div>
            ) : (
              <button onClick={async () => {
                const res = await fetch("/api/billing", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ businessId: ctx.business?.id }) });
                const { url } = await res.json();
                if (url) window.open(url, "_blank");
              }} className="w-full py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl text-sm hover:bg-gray-200 transition-all">
                Manage Subscription →
              </button>
            )}
          </div>
        )}

        {/* Team */}
        {section === "team" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
            <div className="text-sm font-bold">Team Members</div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-[#1a1a2e] flex items-center justify-center text-white text-xs font-bold">{(ctx.user?.name || "U")[0]}</div>
              <div className="flex-1"><div className="text-sm font-medium">{ctx.user?.name || "You"}</div><div className="text-xs text-gray-400">{ctx.user?.email}</div></div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Owner</span>
            </div>
            {plan === "team" ? (
              <div className="flex gap-2">
                <input value={teamEmail} onChange={e => setTeamEmail(e.target.value)} placeholder="team@company.com" className="flex-1 px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-blue-200 outline-none" />
                <button className="px-4 py-2.5 bg-[#1a1a2e] text-white font-bold rounded-xl text-sm hover:bg-[#2a2a3e]">Invite</button>
              </div>
            ) : (
              <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-3 text-center">
                Upgrade to Team plan to invite up to 5 members.
              </div>
            )}
          </div>
        )}

        {/* Danger zone */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-red-100">
          <div className="text-sm font-bold text-red-500 mb-2">Danger Zone</div>
          <button className="text-xs text-red-400 hover:text-red-600">Delete my account and all data →</button>
        </div>
      </div>
    </div>
  );
}
