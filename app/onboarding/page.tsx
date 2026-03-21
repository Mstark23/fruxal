"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// ═══════════════════════════════════════════════════════════════════════════════
// 3-TIER INDUSTRY MODEL
// Tier 1: Solo Entrepreneur (just me, freelancer, gig)  → 49 industries
// Tier 2: Mid-Size Business (2-25 employees)             → 124 industries
// Tier 3: Growth Business (25+ employees, scaling)       → 32 industries
// Total: 205 industries
// ═══════════════════════════════════════════════════════════════════════════════

const TIERS = [
  {
    id: "solo-entrepreneur", name: "Solo Entrepreneur", icon: "🧑‍💻",
    tagline: "Just me — freelancer, solo practitioner, or gig worker",
    examples: "Hairstylist, Trucker, Personal Trainer, Copywriter, Carpenter",
    border: "border-emerald-400/30", bg: "bg-emerald-500/10", text: "text-emerald-300",
  },
  {
    id: "mid-size-business", name: "Mid-Size Business", icon: "🏪",
    tagline: "2–25 employees — local shops, practices, and service companies",
    examples: "Restaurant, Dental, Construction, Salon, Law Firm, Retail",
    border: "border-blue-400/30", bg: "bg-blue-500/10", text: "text-blue-300",
  },
  {
    id: "growth-business", name: "Growth Business", icon: "🏢",
    tagline: "25+ employees — scaling operations, multiple locations, or high revenue",
    examples: "Manufacturing, Hotel, Franchise, Wholesaler, Staffing, Telecom",
    border: "border-purple-400/30", bg: "bg-purple-500/10", text: "text-purple-300",
  },
];

// ─── TIER 1: SOLO ENTREPRENEUR (49) ─────────────────────────────────────────
const SOLO_ENTREPRENEUR = [
  // Healthcare (9)
  {id:"acupuncturist",name:"Acupuncturist",icon:"🪡",cat:"Health"},
  {id:"naturopath",name:"Naturopathic Doctor",icon:"🌿",cat:"Health"},
  {id:"dietitian",name:"Dietitian / Nutritionist",icon:"🥗",cat:"Health"},
  {id:"occupational-therapist",name:"Occupational Therapist",icon:"🤲",cat:"Health"},
  {id:"speech-pathologist",name:"Speech-Language Pathologist",icon:"🗣️",cat:"Health"},
  {id:"midwife-doula",name:"Midwife / Doula",icon:"👶",cat:"Health"},
  {id:"osteopath",name:"Osteopath",icon:"🦴",cat:"Health"},
  {id:"kinesiologist",name:"Kinesiologist",icon:"🏃",cat:"Health"},
  {id:"podiatrist",name:"Podiatrist / Chiropodist",icon:"🦶",cat:"Health"},
  // Trades (8)
  {id:"welder",name:"Welder",icon:"🔥",cat:"Trades"},
  {id:"carpenter",name:"Carpenter",icon:"🪚",cat:"Trades"},
  {id:"tiler-flooring",name:"Tiler / Flooring",icon:"🧱",cat:"Trades"},
  {id:"mason-bricklayer",name:"Mason / Bricklayer",icon:"🧱",cat:"Trades"},
  {id:"drywall-plasterer",name:"Drywall / Plasterer",icon:"🏗️",cat:"Trades"},
  {id:"fencer",name:"Fence Installer",icon:"🏡",cat:"Trades"},
  {id:"pool-service",name:"Pool Service",icon:"🏊",cat:"Trades"},
  {id:"arborist",name:"Arborist / Tree Service",icon:"🌳",cat:"Trades"},
  // Transport (3)
  {id:"owner-operator-trucker",name:"Owner-Operator Trucker",icon:"🚛",cat:"Transport"},
  {id:"gig-delivery",name:"Gig Delivery Driver",icon:"🛵",cat:"Transport"},
  {id:"hotshot-expedite",name:"Hotshot / Expedite",icon:"🚚",cat:"Transport"},
  // Creative (8)
  {id:"copywriter",name:"Copywriter / Writer",icon:"✍️",cat:"Creative"},
  {id:"videographer",name:"Videographer",icon:"🎥",cat:"Creative"},
  {id:"podcaster",name:"Podcaster",icon:"🎙️",cat:"Creative"},
  {id:"musician-dj",name:"Musician / DJ",icon:"🎵",cat:"Creative"},
  {id:"voice-actor",name:"Voice Actor",icon:"🎤",cat:"Creative"},
  {id:"social-media-manager",name:"Social Media Manager",icon:"📱",cat:"Creative"},
  {id:"ux-designer",name:"UX/UI Designer",icon:"🎨",cat:"Creative"},
  {id:"animator",name:"Animator / Motion",icon:"🎬",cat:"Creative"},
  // Beauty (4)
  {id:"hairstylist-solo",name:"Hairstylist (Booth Renter)",icon:"✂️",cat:"Beauty"},
  {id:"esthetician",name:"Esthetician",icon:"🧖",cat:"Beauty"},
  {id:"makeup-artist",name:"Makeup Artist",icon:"💄",cat:"Beauty"},
  {id:"lash-brow-tech",name:"Lash & Brow Tech",icon:"👁️",cat:"Beauty"},
  // Fitness (4)
  {id:"personal-trainer",name:"Personal Trainer",icon:"💪",cat:"Fitness"},
  {id:"yoga-instructor",name:"Yoga Instructor",icon:"🧘",cat:"Fitness"},
  {id:"pilates-instructor",name:"Pilates Instructor",icon:"🤸",cat:"Fitness"},
  {id:"sports-coach",name:"Sports Coach",icon:"🏆",cat:"Fitness"},
  // Sales (2)
  {id:"travel-agent",name:"Travel Agent",icon:"✈️",cat:"Sales"},
  {id:"direct-sales",name:"Direct Sales / MLM",icon:"🤝",cat:"Sales"},
  // Other (11)
  {id:"pet-care",name:"Pet Care / Dog Walker",icon:"🐕",cat:"Other"},
  {id:"house-cleaner-solo",name:"House Cleaner",icon:"🧹",cat:"Other"},
  {id:"virtual-assistant",name:"Virtual Assistant",icon:"💻",cat:"Other"},
  {id:"personal-chef",name:"Personal Chef",icon:"👨‍🍳",cat:"Other"},
  {id:"handyman",name:"Handyman",icon:"🔨",cat:"Other"},
  {id:"mobile-mechanic",name:"Mobile Mechanic",icon:"🔧",cat:"Other"},
  {id:"snow-removal-solo",name:"Snow Removal",icon:"❄️",cat:"Other"},
  {id:"bookkeeper-solo",name:"Bookkeeper",icon:"📒",cat:"Other"},
  {id:"notary",name:"Notary",icon:"📜",cat:"Other"},
  {id:"appraiser",name:"Appraiser",icon:"🏠",cat:"Other"},
  {id:"private-investigator",name:"Private Investigator",icon:"🔍",cat:"Other"},
];

// ─── TIER 2: MID-SIZE BUSINESS (124) ────────────────────────────────────────
const MID_SIZE_BUSINESS = [
  // Food (7)
  {id:"restaurant",name:"Restaurant",icon:"🍽️",cat:"Food"},{id:"bar-nightclub",name:"Bar & Nightclub",icon:"🍸",cat:"Food"},
  {id:"cafe-coffee-shop",name:"Café & Coffee Shop",icon:"☕",cat:"Food"},{id:"bakery",name:"Bakery",icon:"🧁",cat:"Food"},
  {id:"catering",name:"Catering",icon:"🍴",cat:"Food"},{id:"food-truck",name:"Food Truck",icon:"🚚",cat:"Food"},
  {id:"food-delivery",name:"Food Delivery",icon:"🛵",cat:"Food"},
  // Retail (17)
  {id:"retail",name:"Retail Store",icon:"🛍️",cat:"Retail"},{id:"ecommerce",name:"E-Commerce",icon:"🛒",cat:"Retail"},
  {id:"grocery",name:"Grocery Store",icon:"🥬",cat:"Retail"},{id:"convenience-store",name:"Convenience Store",icon:"🏪",cat:"Retail"},
  {id:"clothing-boutique",name:"Clothing Boutique",icon:"👗",cat:"Retail"},{id:"furniture-store",name:"Furniture Store",icon:"🛋️",cat:"Retail"},
  {id:"jewelry-store",name:"Jewelry Store",icon:"💍",cat:"Retail"},{id:"pet-store",name:"Pet Store",icon:"🐾",cat:"Retail"},
  {id:"hardware-store",name:"Hardware Store",icon:"🔩",cat:"Retail"},{id:"liquor-store",name:"Liquor Store",icon:"🍷",cat:"Retail"},
  {id:"florist",name:"Florist",icon:"🌸",cat:"Retail"},{id:"bookstore",name:"Bookstore",icon:"📚",cat:"Retail"},
  {id:"sporting-goods",name:"Sporting Goods",icon:"⚽",cat:"Retail"},{id:"vape-smoke-shop",name:"Vape & Smoke Shop",icon:"💨",cat:"Retail"},
  {id:"auto-parts",name:"Auto Parts",icon:"🔩",cat:"Retail"},{id:"cannabis-retail",name:"Cannabis Retail",icon:"🌿",cat:"Retail"},
  {id:"subscription-box",name:"Subscription Box",icon:"📦",cat:"Retail"},
  // Health (12)
  {id:"healthcare",name:"Healthcare",icon:"🏥",cat:"Health"},{id:"dental",name:"Dental Practice",icon:"🦷",cat:"Health"},
  {id:"chiropractic",name:"Chiropractic",icon:"🦴",cat:"Health"},{id:"optometry",name:"Optometry",icon:"👓",cat:"Health"},
  {id:"physiotherapy",name:"Physiotherapy",icon:"🏃",cat:"Health"},{id:"pharmacy",name:"Pharmacy",icon:"💊",cat:"Health"},
  {id:"medical-spa",name:"Medical Spa",icon:"✨",cat:"Health"},{id:"massage-therapy",name:"Massage Therapy",icon:"💆",cat:"Health"},
  {id:"mental-health",name:"Mental Health",icon:"🧠",cat:"Health"},{id:"medical-lab",name:"Medical Lab",icon:"🔬",cat:"Health"},
  {id:"veterinary",name:"Veterinary",icon:"🐕",cat:"Health"},{id:"home-care",name:"Home Care",icon:"🏠",cat:"Health"},
  // Trades (10)
  {id:"construction",name:"Construction",icon:"🏗️",cat:"Trades"},{id:"roofing",name:"Roofing",icon:"🏠",cat:"Trades"},
  {id:"electrical",name:"Electrical",icon:"⚡",cat:"Trades"},{id:"plumbing",name:"Plumbing",icon:"🔧",cat:"Trades"},
  {id:"hvac",name:"HVAC",icon:"🔥",cat:"Trades"},{id:"painting",name:"Painting",icon:"🎨",cat:"Trades"},
  {id:"landscaping",name:"Landscaping",icon:"🌿",cat:"Trades"},{id:"demolition",name:"Demolition",icon:"💥",cat:"Trades"},
  {id:"trades",name:"General Trades",icon:"🔨",cat:"Trades"},{id:"solar-energy",name:"Solar Energy",icon:"☀️",cat:"Trades"},
  // Professional (14)
  {id:"accounting",name:"Accounting",icon:"📊",cat:"Professional"},{id:"law-firm",name:"Law Firm",icon:"⚖️",cat:"Professional"},
  {id:"consulting",name:"Consulting",icon:"💼",cat:"Professional"},{id:"architecture",name:"Architecture",icon:"📐",cat:"Professional"},
  {id:"engineering",name:"Engineering",icon:"⚙️",cat:"Professional"},{id:"financial-advisor",name:"Financial Advisor",icon:"💰",cat:"Professional"},
  {id:"insurance-broker",name:"Insurance Broker",icon:"🛡️",cat:"Professional"},{id:"mortgage-broker",name:"Mortgage Broker",icon:"🏦",cat:"Professional"},
  {id:"bookkeeping",name:"Bookkeeping",icon:"📒",cat:"Professional"},{id:"tax-preparation",name:"Tax Preparation",icon:"📋",cat:"Professional"},
  {id:"hr-consulting",name:"HR Consulting",icon:"👥",cat:"Professional"},{id:"marketing-consultant",name:"Marketing Consultant",icon:"📣",cat:"Professional"},
  {id:"environmental-consulting",name:"Environmental",icon:"🌎",cat:"Professional"},{id:"surveying",name:"Surveying",icon:"📏",cat:"Professional"},
  // Tech (4)
  {id:"saas",name:"SaaS / Software",icon:"☁️",cat:"Tech"},{id:"web-development",name:"Web Development",icon:"💻",cat:"Tech"},
  {id:"app-development",name:"App Development",icon:"📱",cat:"Tech"},{id:"it-services",name:"IT Services",icon:"💻",cat:"Tech"},
  // Real Estate (4)
  {id:"real-estate",name:"Real Estate",icon:"🏠",cat:"Real Estate"},{id:"property-management",name:"Property Mgmt",icon:"🏢",cat:"Real Estate"},
  {id:"home-inspection",name:"Home Inspection",icon:"🔍",cat:"Real Estate"},{id:"home-staging",name:"Home Staging",icon:"🪑",cat:"Real Estate"},
  // Auto (5)
  {id:"auto-repair",name:"Auto Repair",icon:"🔧",cat:"Auto"},{id:"auto-body",name:"Auto Body",icon:"🚙",cat:"Auto"},
  {id:"auto-detailing",name:"Auto Detailing",icon:"✨",cat:"Auto"},{id:"tire-shop",name:"Tire Shop",icon:"🛞",cat:"Auto"},
  {id:"car-wash",name:"Car Wash",icon:"🚿",cat:"Auto"},
  // Personal (8)
  {id:"beauty-salon",name:"Beauty Salon",icon:"💅",cat:"Personal"},{id:"barber-shop",name:"Barber Shop",icon:"✂️",cat:"Personal"},
  {id:"nail-salon",name:"Nail Salon",icon:"💅",cat:"Personal"},{id:"spa",name:"Spa",icon:"🧖",cat:"Personal"},
  {id:"tattoo-piercing",name:"Tattoo & Piercing",icon:"🎨",cat:"Personal"},{id:"dry-cleaning",name:"Dry Cleaning",icon:"👔",cat:"Personal"},
  {id:"laundromat",name:"Laundromat",icon:"🧺",cat:"Personal"},{id:"photography",name:"Photography",icon:"📷",cat:"Personal"},
  // Fitness (9)
  {id:"fitness",name:"Fitness Studio",icon:"💪",cat:"Fitness"},{id:"gym-crossfit",name:"Gym & CrossFit",icon:"🏋️",cat:"Fitness"},
  {id:"yoga-studio",name:"Yoga Studio",icon:"🧘",cat:"Fitness"},{id:"martial-arts",name:"Martial Arts",icon:"🥋",cat:"Fitness"},
  {id:"dance-studio",name:"Dance Studio",icon:"💃",cat:"Fitness"},{id:"golf-course",name:"Golf Course",icon:"⛳",cat:"Fitness"},
  {id:"bowling-alley",name:"Bowling Alley",icon:"🎳",cat:"Fitness"},{id:"escape-room",name:"Escape Room",icon:"🔑",cat:"Fitness"},
  {id:"amusement-recreation",name:"Amusement & Rec",icon:"🎢",cat:"Fitness"},
  // Education (6)
  {id:"daycare",name:"Daycare",icon:"👶",cat:"Education"},{id:"childcare-home",name:"Home Childcare",icon:"👶",cat:"Education"},
  {id:"tutoring",name:"Tutoring",icon:"📚",cat:"Education"},{id:"driving-school",name:"Driving School",icon:"🚗",cat:"Education"},
  {id:"music-school",name:"Music School",icon:"🎵",cat:"Education"},{id:"training-coaching",name:"Training & Coaching",icon:"🎯",cat:"Education"},
  // Hospitality (2)
  {id:"bed-breakfast",name:"Bed & Breakfast",icon:"🛏️",cat:"Hospitality"},{id:"event-planning",name:"Event Planning",icon:"🎉",cat:"Hospitality"},
  // Transport (4)
  {id:"courier-delivery",name:"Courier & Delivery",icon:"📬",cat:"Transport"},{id:"taxi-rideshare",name:"Taxi & Rideshare",icon:"🚕",cat:"Transport"},
  {id:"moving-company",name:"Moving Company",icon:"📦",cat:"Transport"},{id:"towing",name:"Towing",icon:"🚗",cat:"Transport"},
  // Industrial (2)
  {id:"woodworking",name:"Woodworking",icon:"🪵",cat:"Industrial"},{id:"printing",name:"Printing",icon:"🖨️",cat:"Industrial"},
  // Agriculture (3)
  {id:"farming",name:"Farming",icon:"🌾",cat:"Agriculture"},{id:"ranching",name:"Ranching",icon:"🐄",cat:"Agriculture"},
  {id:"greenhouse-nursery",name:"Greenhouse & Nursery",icon:"🌱",cat:"Agriculture"},
  // Creative (5)
  {id:"agency",name:"Marketing Agency",icon:"📣",cat:"Creative"},{id:"graphic-design",name:"Graphic Design",icon:"🎨",cat:"Creative"},
  {id:"interior-design",name:"Interior Design",icon:"🏡",cat:"Creative"},{id:"translation",name:"Translation",icon:"🌍",cat:"Creative"},
  {id:"influencer-creator",name:"Influencer & Creator",icon:"📸",cat:"Creative"},
  // Services (9)
  {id:"cleaning",name:"Cleaning Services",icon:"🧹",cat:"Services"},{id:"pest-control",name:"Pest Control",icon:"🐜",cat:"Services"},
  {id:"security-guard",name:"Security Services",icon:"🔐",cat:"Services"},{id:"janitorial-commercial",name:"Commercial Janitorial",icon:"🧹",cat:"Services"},
  {id:"locksmith",name:"Locksmith",icon:"🔑",cat:"Services"},{id:"appliance-repair",name:"Appliance Repair",icon:"🔧",cat:"Services"},
  {id:"computer-repair",name:"Computer Repair",icon:"💻",cat:"Services"},{id:"phone-repair",name:"Phone Repair",icon:"📱",cat:"Services"},
  {id:"upholstery",name:"Upholstery",icon:"🛋️",cat:"Services"},
  // Other (3)
  {id:"nonprofit",name:"Nonprofit",icon:"❤️",cat:"Other"},{id:"church-religious",name:"Church & Religious",icon:"⛪",cat:"Other"},
  {id:"freelancer-gig",name:"Freelancer & Gig",icon:"🧑‍💻",cat:"Other"},
];

// ─── TIER 3: GROWTH BUSINESS (32) ───────────────────────────────────────────
const GROWTH_BUSINESS = [
  {id:"fast-food-franchise",name:"Fast Food Franchise",icon:"🍔",cat:"Food"},
  {id:"food-processing",name:"Food Processing",icon:"🥫",cat:"Food"},
  {id:"beverage-manufacturing",name:"Beverage Mfg",icon:"🍺",cat:"Food"},
  {id:"senior-care",name:"Senior Care",icon:"👴",cat:"Health"},
  {id:"addiction-treatment",name:"Addiction Treatment",icon:"💚",cat:"Health"},
  {id:"car-dealership",name:"Car Dealership",icon:"🚗",cat:"Auto"},
  {id:"collections-agency",name:"Collections Agency",icon:"💰",cat:"Professional"},
  {id:"managed-service-provider",name:"MSP / IT Services",icon:"🖥️",cat:"Tech"},
  {id:"cybersecurity",name:"Cybersecurity",icon:"🔒",cat:"Tech"},
  {id:"data-analytics",name:"Data Analytics",icon:"📊",cat:"Tech"},
  {id:"telecom",name:"Telecom",icon:"📡",cat:"Tech"},
  {id:"hotel-motel",name:"Hotel & Motel",icon:"🏨",cat:"Hospitality"},
  {id:"private-school",name:"Private School",icon:"🎓",cat:"Education"},
  {id:"trucking",name:"Trucking Fleet",icon:"🚛",cat:"Transport"},
  {id:"freight-broker",name:"Freight Broker",icon:"🚛",cat:"Transport"},
  {id:"warehousing",name:"Warehousing",icon:"🏭",cat:"Transport"},
  {id:"manufacturing",name:"Manufacturing",icon:"🏭",cat:"Industrial"},
  {id:"metal-fabrication",name:"Metal Fabrication",icon:"⚙️",cat:"Industrial"},
  {id:"textile-apparel",name:"Textile & Apparel",icon:"👕",cat:"Industrial"},
  {id:"plastics-rubber",name:"Plastics & Rubber",icon:"🧪",cat:"Industrial"},
  {id:"cannabis",name:"Cannabis Production",icon:"🌿",cat:"Industrial"},
  {id:"forestry-logging",name:"Forestry & Logging",icon:"🌲",cat:"Agriculture"},
  {id:"fishing",name:"Commercial Fishing",icon:"🎣",cat:"Agriculture"},
  {id:"mining",name:"Mining",icon:"⛏️",cat:"Agriculture"},
  {id:"oil-gas",name:"Oil & Gas",icon:"🛢️",cat:"Agriculture"},
  {id:"media-production",name:"Media Production",icon:"🎬",cat:"Creative"},
  {id:"publishing",name:"Publishing",icon:"📰",cat:"Creative"},
  {id:"staffing-agency",name:"Staffing Agency",icon:"👥",cat:"Services"},
  {id:"funeral-home",name:"Funeral Home",icon:"⚱️",cat:"Services"},
  {id:"waste-management",name:"Waste Management",icon:"♻️",cat:"Services"},
  {id:"wholesale",name:"Wholesale Distribution",icon:"📦",cat:"Distribution"},
  {id:"import-export",name:"Import / Export",icon:"🚢",cat:"Distribution"},
];

const ALL_INDUSTRIES = [...SOLO_ENTREPRENEUR, ...MID_SIZE_BUSINESS, ...GROWTH_BUSINESS];

function getCats(tier: string) {
  const list = tier === "solo-entrepreneur" ? SOLO_ENTREPRENEUR : tier === "mid-size-business" ? MID_SIZE_BUSINESS : GROWTH_BUSINESS;
  return [...new Set(list.map(i => i.cat))];
}

const REVS: Record<string, {id:string;label:string;v:number}[]> = {
  "solo-entrepreneur": [
    {id:"0-2k",label:"Under $2K/mo",v:1500},{id:"2k-5k",label:"$2K – $5K/mo",v:3500},
    {id:"5k-10k",label:"$5K – $10K/mo",v:7500},{id:"10k-20k",label:"$10K – $20K/mo",v:15000},
    {id:"20k+",label:"$20K+/mo",v:25000},
  ],
  "mid-size-business": [
    {id:"0-10k",label:"Under $10K/mo",v:7500},{id:"10k-25k",label:"$10K – $25K/mo",v:17500},
    {id:"25k-50k",label:"$25K – $50K/mo",v:37500},{id:"50k-100k",label:"$50K – $100K/mo",v:75000},
    {id:"100k-250k",label:"$100K – $250K/mo",v:175000},{id:"250k+",label:"$250K+/mo",v:375000},
  ],
  "growth-business": [
    {id:"100k-250k",label:"$100K – $250K/mo",v:175000},{id:"250k-500k",label:"$250K – $500K/mo",v:375000},
    {id:"500k-1m",label:"$500K – $1M/mo",v:750000},{id:"1m+",label:"$1M+/mo",v:1500000},
  ],
};

const EMPS: Record<string, {id:string;label:string;v:number}[]> = {
  "solo-entrepreneur": [{id:"1",label:"Just me",v:1},{id:"1c",label:"Me + contractors",v:1}],
  "mid-size-business": [{id:"2-5",label:"2–5",v:3},{id:"6-10",label:"6–10",v:8},{id:"11-25",label:"11–25",v:18}],
  "growth-business": [{id:"25-50",label:"25–50",v:38},{id:"50-100",label:"50–100",v:75},{id:"100+",label:"100+",v:150}],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState("");
  const [biz, setBiz] = useState("");
  const [ind, setInd] = useState("");
  const [rev, setRev] = useState("");
  const [emp, setEmp] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => { if (status === "unauthenticated") router.push("/login"); }, [status, router]);

  const industries = tier === "solo-entrepreneur" ? SOLO_ENTREPRENEUR : tier === "growth-business" ? GROWTH_BUSINESS : MID_SIZE_BUSINESS;
  const revs = REVS[tier] || REVS["mid-size-business"];
  const emps = EMPS[tier] || EMPS["mid-size-business"];
  const cats = useMemo(() => getCats(tier), [tier]);

  const filtered = useMemo(() => {
    let l = industries;
    if (cat) l = l.filter(i => i.cat === cat);
    if (q) { const s = q.toLowerCase(); l = l.filter(i => i.name.toLowerCase().includes(s) || i.id.includes(s)); }
    return l;
  }, [q, cat, industries]);

  const finish = async () => {
    if (!ind || !rev) return;
    setLoading(true); setErr("");
    try {
      const rv = revs.find(r => r.id === rev)?.v || 25000;
      const ev = emps.find(e => e.id === emp)?.v || 5;
      const res = await fetch("/api/business", { method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name: biz || `My ${ALL_INDUSTRIES.find(i=>i.id===ind)?.name||"Business"}`, industry:ind, annualRevenue:rv*12, monthlyRevenue:rv, employeeCount:ev, region: region || "US", province: province || null, tier: tier || "mid-size-business" })
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error||"Failed"); setLoading(false); return; }
      const { businessId } = await res.json();
      try {
        const saved = localStorage.getItem("prescanResults");
        if (saved && businessId) {
          const prescanResults = JSON.parse(saved);
          await fetch("/api/prescan/bridge", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ businessId, prescanResults }) });
          localStorage.removeItem("prescanResults"); localStorage.removeItem("prescanIndustry");
          localStorage.removeItem("prescanRevenue"); localStorage.removeItem("prescanEmployees");
        }
      } catch (e) { /* non-fatal */ }
      router.push("/dashboard");
    } catch { setErr("Something went wrong."); setLoading(false); }
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center bg-[#0a1628]"><div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"/></div>;

  const tierInfo = TIERS.find(t=>t.id===tier);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1628] to-[#1a2d4a] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-6">
          {[0,1,2,3].map(s=><div key={s} className={`h-1.5 rounded-full transition-all ${s<=step?"w-10 bg-emerald-400":"w-6 bg-white/10"}`}/>)}
          <span className="text-[11px] text-blue-200/30 ml-2">{step+1}/4</span>
        </div>

        {/* ═══ STEP 0: PICK YOUR TIER ═══ */}
        {step === 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-black text-white mb-1">What describes your business best?</h2>
            <p className="text-sm text-blue-200/50 mb-4">This helps us show the right industries and the right leak patterns.</p>
            <div className="space-y-3">
              {TIERS.map(t => (
                <button key={t.id} onClick={() => { setTier(t.id); setInd(""); setCat(null); setQ(""); setRev(""); setEmp(""); setStep(1); }}
                  className={`w-full text-left ${t.bg} ${t.border} border rounded-xl p-4 transition-all hover:brightness-125 active:scale-[0.98]`}>
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{t.icon}</span>
                    <div>
                      <div className={`text-base font-black ${t.text}`}>{t.name}</div>
                      <div className="text-sm text-slate-400 mt-0.5">{t.tagline}</div>
                      <div className="text-[11px] text-slate-500 mt-1.5">e.g. {t.examples}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ STEP 1: PICK INDUSTRY ═══ */}
        {step === 1 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-black text-white">{tier==="solo-entrepreneur"?"What kind of work do you do?":"What kind of business?"}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tierInfo?.bg} ${tierInfo?.text}`}>{tierInfo?.name}</span>
            </div>
            <p className="text-sm text-blue-200/50 mb-3">Pick the one that fits best.</p>
            <input type="text" placeholder={`Search ${industries.length} industries...`} value={q} onChange={e=>{setQ(e.target.value);setCat(null);}}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 text-sm mb-3 outline-none focus:border-emerald-400/50"/>
            <div className="flex flex-wrap gap-1 mb-3">
              <button onClick={()=>setCat(null)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${!cat?"bg-emerald-500/20 text-emerald-300 border border-emerald-400/30":"bg-white/5 text-white/40 hover:text-white/60"}`}>All</button>
              {cats.map(c=><button key={c} onClick={()=>{setCat(c===cat?null:c);setQ("");}} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${cat===c?"bg-emerald-500/20 text-emerald-300 border border-emerald-400/30":"bg-white/5 text-white/40 hover:text-white/60"}`}>{c}</button>)}
            </div>
            <div className="max-h-[42vh] overflow-y-auto space-y-0.5 pr-1">
              {filtered.length===0 && <div className="text-center py-8 text-white/30 text-sm">No match for &quot;{q}&quot;</div>}
              {filtered.map(i=><button key={i.id} onClick={()=>{setInd(i.id);setStep(2);}}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-2.5 ${ind===i.id?"bg-emerald-500/20 border border-emerald-400/30":"bg-white/[0.02] hover:bg-white/[0.06] border border-transparent"}`}>
                <span className="text-base">{i.icon}</span><span className="text-sm font-semibold text-white">{i.name}</span>
                <span className="text-[10px] text-white/20 ml-auto">{i.cat}</span>
              </button>)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button onClick={()=>setStep(0)} className="text-xs text-blue-300/40 hover:text-blue-300/60">&larr; Change type</button>
              <span className="text-[10px] text-blue-200/20">{filtered.length} of {industries.length}</span>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: REVENUE ═══ */}
        {step === 2 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-1">{tier==="solo-entrepreneur"?"How much do you make per month?":"Monthly revenue?"}</h2>
            <p className="text-sm text-blue-200/50 mb-4">Rough estimate is fine.</p>
            <div className="space-y-2">{revs.map(r=><button key={r.id} onClick={()=>{setRev(r.id);setStep(3);}}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all ${rev===r.id?"bg-emerald-500/20 border border-emerald-400/30":"bg-white/5 hover:bg-white/10 border border-transparent"}`}>
              <span className="text-sm font-semibold text-white">{r.label}</span></button>)}</div>
            <button onClick={()=>setStep(1)} className="mt-4 text-xs text-blue-300/40 hover:text-blue-300/60">&larr; Back</button>
          </div>
        )}

        {/* ═══ STEP 3: DETAILS + FINISH ═══ */}
        {step === 3 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-1">Almost done!</h2>
            <p className="text-sm text-blue-200/50 mb-5">A couple more things.</p>
            <label className="block text-xs font-bold text-blue-200/40 uppercase tracking-wider mb-1">{tier==="solo-entrepreneur"?"Business name (optional)":"What's it called? (optional)"}</label>
            <input type="text" placeholder={`e.g. ${ALL_INDUSTRIES.find(i=>i.id===ind)?.name||"My Business"}`} value={biz} onChange={e=>setBiz(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm mb-4 outline-none focus:border-emerald-400/50"/>
            <label className="block text-xs font-bold text-blue-200/40 uppercase tracking-wider mb-2">{tier==="solo-entrepreneur"?"Your setup":"Team size"}</label>
            <div className={`grid ${emps.length<=2?"grid-cols-2":"grid-cols-3"} gap-2 mb-4`}>{emps.map(e=><button key={e.id} onClick={()=>setEmp(e.id)}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${emp===e.id?"bg-emerald-500/20 border border-emerald-400/30 text-emerald-300":"bg-white/5 hover:bg-white/10 border border-transparent text-white/70"}`}>{e.label}</button>)}</div>
            <label className="block text-xs font-bold text-blue-200/40 uppercase tracking-wider mb-2">Where are you based?</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[{id:"CA",flag:"🇨🇦",label:"Canada"},{id:"US",flag:"🇺🇸",label:"USA"},{id:"UK",flag:"🇬🇧",label:"UK"},{id:"AU",flag:"🇦🇺",label:"Australia"}].map(r=><button key={r.id} onClick={()=>{setRegion(r.id);if(r.id!=="CA")setProvince("");}}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all flex flex-col items-center gap-1 ${region===r.id?"bg-emerald-500/20 border border-emerald-400/30 text-emerald-300":"bg-white/5 hover:bg-white/10 border border-transparent text-white/70"}`}><span className="text-lg">{r.flag}</span><span className="text-[11px]">{r.label}</span></button>)}
            </div>
            {region==="CA" && (
              <>
                <label className="block text-xs font-bold text-blue-200/40 uppercase tracking-wider mb-2">Province?</label>
                <div className="grid grid-cols-3 gap-1.5 mb-6">
                  {[{id:"ON",n:"Ontario"},{id:"QC",n:"Quebec"},{id:"BC",n:"British Columbia"},{id:"AB",n:"Alberta"},{id:"SK",n:"Saskatchewan"},{id:"MB",n:"Manitoba"},{id:"NB",n:"New Brunswick"},{id:"NS",n:"Nova Scotia"},{id:"PE",n:"PEI"},{id:"NL",n:"Newfoundland"},{id:"NT",n:"NWT"},{id:"YT",n:"Yukon"}].map(p=>(
                    <button key={p.id} onClick={()=>setProvince(p.id)} className={`px-2 py-2 rounded-xl text-[11px] font-semibold transition-all ${province===p.id?"bg-emerald-500/20 border border-emerald-400/30 text-emerald-300":"bg-white/5 hover:bg-white/10 border border-transparent text-white/70"}`}>{p.n}</button>
                  ))}
                </div>
              </>
            )}
            {region!=="CA" && <div className="mb-2"/>}
            {err && <div className="bg-red-500/10 border border-red-400/20 text-red-300 text-sm px-4 py-2 rounded-lg mb-4">{err}</div>}
            <button onClick={finish} disabled={loading||!emp||!region||(region==="CA"&&!province)}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/30 text-white font-black text-base rounded-xl shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98]">
              {loading?"Setting up...":"Let's Go →"}</button>
            <button onClick={()=>setStep(2)} className="mt-3 w-full text-xs text-blue-300/40 hover:text-blue-300/60 text-center">&larr; Back</button>
          </div>
        )}
        <div className="text-center mt-4 text-[10px] text-blue-200/20">Your data is encrypted and never shared.</div>
      </div>
    </div>
  );
}
