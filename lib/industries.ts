// =============================================================================
// SHARED INDUSTRY DATA — Single source of truth for all 205 industries
// Import this wherever you need industry lists, icons, or leak rates.
// =============================================================================

export interface Industry {
  id: string;
  name: string;
  icon: string;
  tier: "solo-entrepreneur" | "mid-size-business" | "growth-business";
  cat: string;
  leakRate: number; // avg % of revenue leaked
  aliases?: string[]; // search aliases (uber, doordash, etc.)
}

// ─── Leak rate defaults by category ─────────────────────────────────────────
// Based on industry benchmarks: higher = more operational complexity / waste
const LR: Record<string, number> = {
  Food: 0.12, Retail: 0.09, Health: 0.10, Trades: 0.13, Professional: 0.08,
  Tech: 0.07, "Real Estate": 0.06, Auto: 0.11, Personal: 0.09, Fitness: 0.10,
  Education: 0.08, Hospitality: 0.11, Transport: 0.12, Industrial: 0.13,
  Agriculture: 0.11, Creative: 0.08, Services: 0.10, Distribution: 0.09,
  Other: 0.10, Beauty: 0.09, Sales: 0.08,
};

function lr(cat: string) { return LR[cat] || 0.10; }

export const ALL_INDUSTRIES: Industry[] = [
  // ═══ SOLO ENTREPRENEUR (49) ═══
  {id:"acupuncturist",name:"Acupuncturist",icon:"🪡",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"naturopath",name:"Naturopathic Doctor",icon:"🌿",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"dietitian",name:"Dietitian / Nutritionist",icon:"🥗",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"occupational-therapist",name:"Occupational Therapist",icon:"🤲",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"speech-pathologist",name:"Speech-Language Pathologist",icon:"🗣️",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"midwife-doula",name:"Midwife / Doula",icon:"👶",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"osteopath",name:"Osteopath",icon:"🦴",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"kinesiologist",name:"Kinesiologist",icon:"🏃",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"podiatrist",name:"Podiatrist / Chiropodist",icon:"🦶",tier:"solo-entrepreneur",cat:"Health",leakRate:lr("Health")},
  {id:"welder",name:"Welder",icon:"🔥",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"carpenter",name:"Carpenter",icon:"🪚",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"tiler-flooring",name:"Tiler / Flooring",icon:"🧱",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"mason-bricklayer",name:"Mason / Bricklayer",icon:"🧱",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"drywall-plasterer",name:"Drywall / Plasterer",icon:"🏗️",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"fencer",name:"Fence Installer",icon:"🏡",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"pool-service",name:"Pool Service",icon:"🏊",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"arborist",name:"Arborist / Tree Service",icon:"🌳",tier:"solo-entrepreneur",cat:"Trades",leakRate:lr("Trades")},
  {id:"owner-operator-trucker",name:"Owner-Operator Trucker",icon:"🚛",tier:"solo-entrepreneur",cat:"Transport",leakRate:lr("Transport"),aliases:["truck driver","trucker","long haul","cdl","semi driver","independent trucker"]},
  {id:"gig-delivery",name:"Gig Delivery Driver",icon:"🛵",tier:"solo-entrepreneur",cat:"Transport",leakRate:lr("Transport"),aliases:["uber","uber eats","doordash","skip the dishes","instacart","grubhub","deliveroo","door dash","skip","food delivery driver","rideshare driver","lyft"]},
  {id:"hotshot-expedite",name:"Hotshot / Expedite",icon:"🚚",tier:"solo-entrepreneur",cat:"Transport",leakRate:lr("Transport"),aliases:["hotshot driver","expedite driver","flatbed","sprinter van"]},
  {id:"copywriter",name:"Copywriter / Writer",icon:"✍️",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative")},
  {id:"videographer",name:"Videographer",icon:"🎥",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative")},
  {id:"podcaster",name:"Podcaster",icon:"🎙️",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative")},
  {id:"musician-dj",name:"Musician / DJ",icon:"🎵",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative"),aliases:["music","band","singer","rapper","producer","beat maker","disc jockey"]},
  {id:"voice-actor",name:"Voice Actor",icon:"🎤",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative")},
  {id:"social-media-manager",name:"Social Media Manager",icon:"📱",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative"),aliases:["smm","instagram manager","tiktok","content creator","social media freelancer"]},
  {id:"ux-designer",name:"UX/UI Designer",icon:"🎨",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative")},
  {id:"animator",name:"Animator / Motion",icon:"🎬",tier:"solo-entrepreneur",cat:"Creative",leakRate:lr("Creative")},
  {id:"hairstylist-solo",name:"Hairstylist (Booth Renter)",icon:"✂️",tier:"solo-entrepreneur",cat:"Beauty",leakRate:lr("Beauty"),aliases:["hair stylist","barber","hair dresser","salon chair renter","booth rent"]},
  {id:"esthetician",name:"Esthetician",icon:"🧖",tier:"solo-entrepreneur",cat:"Beauty",leakRate:lr("Beauty")},
  {id:"makeup-artist",name:"Makeup Artist",icon:"💄",tier:"solo-entrepreneur",cat:"Beauty",leakRate:lr("Beauty")},
  {id:"lash-brow-tech",name:"Lash & Brow Tech",icon:"👁️",tier:"solo-entrepreneur",cat:"Beauty",leakRate:lr("Beauty")},
  {id:"personal-trainer",name:"Personal Trainer",icon:"💪",tier:"solo-entrepreneur",cat:"Fitness",leakRate:lr("Fitness"),aliases:["pt","fitness coach","gym trainer","workout coach"]},
  {id:"yoga-instructor",name:"Yoga Instructor",icon:"🧘",tier:"solo-entrepreneur",cat:"Fitness",leakRate:lr("Fitness")},
  {id:"pilates-instructor",name:"Pilates Instructor",icon:"🤸",tier:"solo-entrepreneur",cat:"Fitness",leakRate:lr("Fitness")},
  {id:"sports-coach",name:"Sports Coach",icon:"🏆",tier:"solo-entrepreneur",cat:"Fitness",leakRate:lr("Fitness")},
  {id:"travel-agent",name:"Travel Agent",icon:"✈️",tier:"solo-entrepreneur",cat:"Sales",leakRate:lr("Sales")},
  {id:"direct-sales",name:"Direct Sales / MLM",icon:"🤝",tier:"solo-entrepreneur",cat:"Sales",leakRate:lr("Sales")},
  {id:"pet-care",name:"Pet Care / Dog Walker",icon:"🐕",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other"),aliases:["dog walking","pet sitting","dog sitter","pet groomer","rover"]},
  {id:"house-cleaner-solo",name:"House Cleaner",icon:"🧹",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"virtual-assistant",name:"Virtual Assistant",icon:"💻",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"personal-chef",name:"Personal Chef",icon:"👨‍🍳",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"handyman",name:"Handyman",icon:"🔨",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"mobile-mechanic",name:"Mobile Mechanic",icon:"🔧",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"snow-removal-solo",name:"Snow Removal",icon:"❄️",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"bookkeeper-solo",name:"Bookkeeper",icon:"📒",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"notary",name:"Notary",icon:"📜",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"appraiser",name:"Appraiser",icon:"🏠",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  {id:"private-investigator",name:"Private Investigator",icon:"🔍",tier:"solo-entrepreneur",cat:"Other",leakRate:lr("Other")},
  // ═══ MID-SIZE BUSINESS (124) ═══
  {id:"restaurant",name:"Restaurant",icon:"🍽️",tier:"mid-size-business",cat:"Food",leakRate:0.12,aliases:["diner","eatery","bistro","fast casual","pizzeria","sushi"]},
  {id:"bar-nightclub",name:"Bar & Nightclub",icon:"🍸",tier:"mid-size-business",cat:"Food",leakRate:0.13},
  {id:"cafe-coffee-shop",name:"Café & Coffee Shop",icon:"☕",tier:"mid-size-business",cat:"Food",leakRate:0.11},
  {id:"bakery",name:"Bakery",icon:"🧁",tier:"mid-size-business",cat:"Food",leakRate:0.11},
  {id:"catering",name:"Catering",icon:"🍴",tier:"mid-size-business",cat:"Food",leakRate:0.12},
  {id:"food-truck",name:"Food Truck",icon:"🚚",tier:"mid-size-business",cat:"Food",leakRate:0.14},
  {id:"food-delivery",name:"Food Delivery",icon:"🛵",tier:"mid-size-business",cat:"Food",leakRate:0.11},
  {id:"retail",name:"Retail Store",icon:"🛍️",tier:"mid-size-business",cat:"Retail",leakRate:0.09},
  {id:"ecommerce",name:"E-Commerce",icon:"🛒",tier:"mid-size-business",cat:"Retail",leakRate:0.09,aliases:["shopify","amazon seller","etsy","online store","dropshipping","woocommerce"]},
  {id:"grocery",name:"Grocery Store",icon:"🥬",tier:"mid-size-business",cat:"Retail",leakRate:0.08},
  {id:"convenience-store",name:"Convenience Store",icon:"🏪",tier:"mid-size-business",cat:"Retail",leakRate:0.09},
  {id:"clothing-boutique",name:"Clothing Boutique",icon:"👗",tier:"mid-size-business",cat:"Retail",leakRate:0.10},
  {id:"furniture-store",name:"Furniture Store",icon:"🛋️",tier:"mid-size-business",cat:"Retail",leakRate:0.09},
  {id:"jewelry-store",name:"Jewelry Store",icon:"💍",tier:"mid-size-business",cat:"Retail",leakRate:0.08},
  {id:"pet-store",name:"Pet Store",icon:"🐾",tier:"mid-size-business",cat:"Retail",leakRate:0.10},
  {id:"hardware-store",name:"Hardware Store",icon:"🔩",tier:"mid-size-business",cat:"Retail",leakRate:0.09},
  {id:"liquor-store",name:"Liquor Store",icon:"🍷",tier:"mid-size-business",cat:"Retail",leakRate:0.07},
  {id:"florist",name:"Florist",icon:"🌸",tier:"mid-size-business",cat:"Retail",leakRate:0.12},
  {id:"bookstore",name:"Bookstore",icon:"📚",tier:"mid-size-business",cat:"Retail",leakRate:0.08},
  {id:"sporting-goods",name:"Sporting Goods",icon:"⚽",tier:"mid-size-business",cat:"Retail",leakRate:0.09},
  {id:"vape-smoke-shop",name:"Vape & Smoke Shop",icon:"💨",tier:"mid-size-business",cat:"Retail",leakRate:0.10},
  {id:"auto-parts",name:"Auto Parts",icon:"🔩",tier:"mid-size-business",cat:"Retail",leakRate:0.09},
  {id:"cannabis-retail",name:"Cannabis Retail",icon:"🌿",tier:"mid-size-business",cat:"Retail",leakRate:0.11},
  {id:"subscription-box",name:"Subscription Box",icon:"📦",tier:"mid-size-business",cat:"Retail",leakRate:0.10},
  {id:"healthcare",name:"Healthcare",icon:"🏥",tier:"mid-size-business",cat:"Health",leakRate:0.11},
  {id:"dental",name:"Dental Practice",icon:"🦷",tier:"mid-size-business",cat:"Health",leakRate:0.10},
  {id:"chiropractic",name:"Chiropractic",icon:"🦴",tier:"mid-size-business",cat:"Health",leakRate:0.09},
  {id:"optometry",name:"Optometry",icon:"👓",tier:"mid-size-business",cat:"Health",leakRate:0.09},
  {id:"physiotherapy",name:"Physiotherapy",icon:"🏃",tier:"mid-size-business",cat:"Health",leakRate:0.09},
  {id:"pharmacy",name:"Pharmacy",icon:"💊",tier:"mid-size-business",cat:"Health",leakRate:0.08},
  {id:"medical-spa",name:"Medical Spa",icon:"✨",tier:"mid-size-business",cat:"Health",leakRate:0.11},
  {id:"massage-therapy",name:"Massage Therapy",icon:"💆",tier:"mid-size-business",cat:"Health",leakRate:0.10},
  {id:"mental-health",name:"Mental Health",icon:"🧠",tier:"mid-size-business",cat:"Health",leakRate:0.09},
  {id:"medical-lab",name:"Medical Lab",icon:"🔬",tier:"mid-size-business",cat:"Health",leakRate:0.08},
  {id:"veterinary",name:"Veterinary",icon:"🐕",tier:"mid-size-business",cat:"Health",leakRate:0.10},
  {id:"home-care",name:"Home Care",icon:"🏠",tier:"mid-size-business",cat:"Health",leakRate:0.11},
  {id:"construction",name:"Construction",icon:"🏗️",tier:"mid-size-business",cat:"Trades",leakRate:0.14},
  {id:"roofing",name:"Roofing",icon:"🏠",tier:"mid-size-business",cat:"Trades",leakRate:0.13},
  {id:"electrical",name:"Electrical",icon:"⚡",tier:"mid-size-business",cat:"Trades",leakRate:0.12},
  {id:"plumbing",name:"Plumbing",icon:"🔧",tier:"mid-size-business",cat:"Trades",leakRate:0.12},
  {id:"hvac",name:"HVAC",icon:"🔥",tier:"mid-size-business",cat:"Trades",leakRate:0.12},
  {id:"painting",name:"Painting",icon:"🎨",tier:"mid-size-business",cat:"Trades",leakRate:0.13},
  {id:"landscaping",name:"Landscaping",icon:"🌿",tier:"mid-size-business",cat:"Trades",leakRate:0.12},
  {id:"demolition",name:"Demolition",icon:"💥",tier:"mid-size-business",cat:"Trades",leakRate:0.14},
  {id:"trades",name:"General Trades",icon:"🔨",tier:"mid-size-business",cat:"Trades",leakRate:0.13},
  {id:"solar-energy",name:"Solar Energy",icon:"☀️",tier:"mid-size-business",cat:"Trades",leakRate:0.11},
  {id:"accounting",name:"Accounting",icon:"📊",tier:"mid-size-business",cat:"Professional",leakRate:0.07},
  {id:"law-firm",name:"Law Firm",icon:"⚖️",tier:"mid-size-business",cat:"Professional",leakRate:0.10},
  {id:"consulting",name:"Consulting",icon:"💼",tier:"mid-size-business",cat:"Professional",leakRate:0.08},
  {id:"architecture",name:"Architecture",icon:"📐",tier:"mid-size-business",cat:"Professional",leakRate:0.09},
  {id:"engineering",name:"Engineering",icon:"⚙️",tier:"mid-size-business",cat:"Professional",leakRate:0.08},
  {id:"financial-advisor",name:"Financial Advisor",icon:"💰",tier:"mid-size-business",cat:"Professional",leakRate:0.05},
  {id:"insurance-broker",name:"Insurance Broker",icon:"🛡️",tier:"mid-size-business",cat:"Professional",leakRate:0.06},
  {id:"mortgage-broker",name:"Mortgage Broker",icon:"🏦",tier:"mid-size-business",cat:"Professional",leakRate:0.06},
  {id:"bookkeeping",name:"Bookkeeping",icon:"📒",tier:"mid-size-business",cat:"Professional",leakRate:0.07},
  {id:"tax-preparation",name:"Tax Preparation",icon:"📋",tier:"mid-size-business",cat:"Professional",leakRate:0.07},
  {id:"hr-consulting",name:"HR Consulting",icon:"👥",tier:"mid-size-business",cat:"Professional",leakRate:0.08},
  {id:"marketing-consultant",name:"Marketing Consultant",icon:"📣",tier:"mid-size-business",cat:"Professional",leakRate:0.09},
  {id:"environmental-consulting",name:"Environmental",icon:"🌎",tier:"mid-size-business",cat:"Professional",leakRate:0.08},
  {id:"surveying",name:"Surveying",icon:"📏",tier:"mid-size-business",cat:"Professional",leakRate:0.09},
  {id:"saas",name:"SaaS / Software",icon:"☁️",tier:"mid-size-business",cat:"Tech",leakRate:0.08},
  {id:"web-development",name:"Web Development",icon:"💻",tier:"mid-size-business",cat:"Tech",leakRate:0.07},
  {id:"app-development",name:"App Development",icon:"📱",tier:"mid-size-business",cat:"Tech",leakRate:0.07},
  {id:"it-services",name:"IT Services",icon:"💻",tier:"mid-size-business",cat:"Tech",leakRate:0.08},
  {id:"real-estate",name:"Real Estate",icon:"🏠",tier:"mid-size-business",cat:"Real Estate",leakRate:0.06},
  {id:"property-management",name:"Property Mgmt",icon:"🏢",tier:"mid-size-business",cat:"Real Estate",leakRate:0.07},
  {id:"home-inspection",name:"Home Inspection",icon:"🔍",tier:"mid-size-business",cat:"Real Estate",leakRate:0.08},
  {id:"home-staging",name:"Home Staging",icon:"🪑",tier:"mid-size-business",cat:"Real Estate",leakRate:0.09},
  {id:"auto-repair",name:"Auto Repair",icon:"🔧",tier:"mid-size-business",cat:"Auto",leakRate:0.11},
  {id:"auto-body",name:"Auto Body",icon:"🚙",tier:"mid-size-business",cat:"Auto",leakRate:0.12},
  {id:"auto-detailing",name:"Auto Detailing",icon:"✨",tier:"mid-size-business",cat:"Auto",leakRate:0.10},
  {id:"tire-shop",name:"Tire Shop",icon:"🛞",tier:"mid-size-business",cat:"Auto",leakRate:0.10},
  {id:"car-wash",name:"Car Wash",icon:"🚿",tier:"mid-size-business",cat:"Auto",leakRate:0.11},
  {id:"beauty-salon",name:"Beauty Salon",icon:"💅",tier:"mid-size-business",cat:"Personal",leakRate:0.09},
  {id:"barber-shop",name:"Barber Shop",icon:"✂️",tier:"mid-size-business",cat:"Personal",leakRate:0.09},
  {id:"nail-salon",name:"Nail Salon",icon:"💅",tier:"mid-size-business",cat:"Personal",leakRate:0.10},
  {id:"spa",name:"Spa",icon:"🧖",tier:"mid-size-business",cat:"Personal",leakRate:0.10},
  {id:"tattoo-piercing",name:"Tattoo & Piercing",icon:"🎨",tier:"mid-size-business",cat:"Personal",leakRate:0.09},
  {id:"dry-cleaning",name:"Dry Cleaning",icon:"👔",tier:"mid-size-business",cat:"Personal",leakRate:0.08},
  {id:"laundromat",name:"Laundromat",icon:"🧺",tier:"mid-size-business",cat:"Personal",leakRate:0.07},
  {id:"photography",name:"Photography",icon:"📷",tier:"mid-size-business",cat:"Personal",leakRate:0.09},
  {id:"fitness",name:"Fitness Studio",icon:"💪",tier:"mid-size-business",cat:"Fitness",leakRate:0.10},
  {id:"gym-crossfit",name:"Gym & CrossFit",icon:"🏋️",tier:"mid-size-business",cat:"Fitness",leakRate:0.11},
  {id:"yoga-studio",name:"Yoga Studio",icon:"🧘",tier:"mid-size-business",cat:"Fitness",leakRate:0.10},
  {id:"martial-arts",name:"Martial Arts",icon:"🥋",tier:"mid-size-business",cat:"Fitness",leakRate:0.10},
  {id:"dance-studio",name:"Dance Studio",icon:"💃",tier:"mid-size-business",cat:"Fitness",leakRate:0.10},
  {id:"golf-course",name:"Golf Course",icon:"⛳",tier:"mid-size-business",cat:"Fitness",leakRate:0.12},
  {id:"bowling-alley",name:"Bowling Alley",icon:"🎳",tier:"mid-size-business",cat:"Fitness",leakRate:0.11},
  {id:"escape-room",name:"Escape Room",icon:"🔑",tier:"mid-size-business",cat:"Fitness",leakRate:0.10},
  {id:"amusement-recreation",name:"Amusement & Rec",icon:"🎢",tier:"mid-size-business",cat:"Fitness",leakRate:0.12},
  {id:"daycare",name:"Daycare",icon:"👶",tier:"mid-size-business",cat:"Education",leakRate:0.09},
  {id:"childcare-home",name:"Home Childcare",icon:"👶",tier:"mid-size-business",cat:"Education",leakRate:0.08},
  {id:"tutoring",name:"Tutoring",icon:"📚",tier:"mid-size-business",cat:"Education",leakRate:0.07},
  {id:"driving-school",name:"Driving School",icon:"🚗",tier:"mid-size-business",cat:"Education",leakRate:0.09},
  {id:"music-school",name:"Music School",icon:"🎵",tier:"mid-size-business",cat:"Education",leakRate:0.09},
  {id:"training-coaching",name:"Training & Coaching",icon:"🎯",tier:"mid-size-business",cat:"Education",leakRate:0.08},
  {id:"bed-breakfast",name:"Bed & Breakfast",icon:"🛏️",tier:"mid-size-business",cat:"Hospitality",leakRate:0.11},
  {id:"event-planning",name:"Event Planning",icon:"🎉",tier:"mid-size-business",cat:"Hospitality",leakRate:0.10},
  {id:"courier-delivery",name:"Courier & Delivery",icon:"📬",tier:"mid-size-business",cat:"Transport",leakRate:0.11},
  {id:"taxi-rideshare",name:"Taxi & Rideshare",icon:"🚕",tier:"mid-size-business",cat:"Transport",leakRate:0.12,aliases:["uber","lyft","cab","taxi company","rideshare company"]},
  {id:"moving-company",name:"Moving Company",icon:"📦",tier:"mid-size-business",cat:"Transport",leakRate:0.13},
  {id:"towing",name:"Towing",icon:"🚗",tier:"mid-size-business",cat:"Transport",leakRate:0.12},
  {id:"woodworking",name:"Woodworking",icon:"🪵",tier:"mid-size-business",cat:"Industrial",leakRate:0.12},
  {id:"printing",name:"Printing",icon:"🖨️",tier:"mid-size-business",cat:"Industrial",leakRate:0.10},
  {id:"farming",name:"Farming",icon:"🌾",tier:"mid-size-business",cat:"Agriculture",leakRate:0.11},
  {id:"ranching",name:"Ranching",icon:"🐄",tier:"mid-size-business",cat:"Agriculture",leakRate:0.12},
  {id:"greenhouse-nursery",name:"Greenhouse & Nursery",icon:"🌱",tier:"mid-size-business",cat:"Agriculture",leakRate:0.10},
  {id:"agency",name:"Marketing Agency",icon:"📣",tier:"mid-size-business",cat:"Creative",leakRate:0.10},
  {id:"graphic-design",name:"Graphic Design",icon:"🎨",tier:"mid-size-business",cat:"Creative",leakRate:0.08},
  {id:"interior-design",name:"Interior Design",icon:"🏡",tier:"mid-size-business",cat:"Creative",leakRate:0.09},
  {id:"translation",name:"Translation",icon:"🌍",tier:"mid-size-business",cat:"Creative",leakRate:0.07},
  {id:"influencer-creator",name:"Influencer & Creator",icon:"📸",tier:"mid-size-business",cat:"Creative",leakRate:0.08},
  {id:"cleaning",name:"Cleaning Services",icon:"🧹",tier:"mid-size-business",cat:"Services",leakRate:0.10},
  {id:"pest-control",name:"Pest Control",icon:"🐜",tier:"mid-size-business",cat:"Services",leakRate:0.10},
  {id:"security-guard",name:"Security Services",icon:"🔐",tier:"mid-size-business",cat:"Services",leakRate:0.09},
  {id:"janitorial-commercial",name:"Commercial Janitorial",icon:"🧹",tier:"mid-size-business",cat:"Services",leakRate:0.10},
  {id:"locksmith",name:"Locksmith",icon:"🔑",tier:"mid-size-business",cat:"Services",leakRate:0.09},
  {id:"appliance-repair",name:"Appliance Repair",icon:"🔧",tier:"mid-size-business",cat:"Services",leakRate:0.10},
  {id:"computer-repair",name:"Computer Repair",icon:"💻",tier:"mid-size-business",cat:"Services",leakRate:0.09},
  {id:"phone-repair",name:"Phone Repair",icon:"📱",tier:"mid-size-business",cat:"Services",leakRate:0.10},
  {id:"upholstery",name:"Upholstery",icon:"🛋️",tier:"mid-size-business",cat:"Services",leakRate:0.09},
  {id:"nonprofit",name:"Nonprofit",icon:"❤️",tier:"mid-size-business",cat:"Other",leakRate:0.10},
  {id:"church-religious",name:"Church & Religious",icon:"⛪",tier:"mid-size-business",cat:"Other",leakRate:0.08},
  {id:"freelancer-gig",name:"Freelancer & Gig",icon:"🧑‍💻",tier:"mid-size-business",cat:"Other",leakRate:0.09},
  // ═══ GROWTH BUSINESS (32) ═══
  {id:"fast-food-franchise",name:"Fast Food Franchise",icon:"🍔",tier:"growth-business",cat:"Food",leakRate:0.10},
  {id:"food-processing",name:"Food Processing",icon:"🥫",tier:"growth-business",cat:"Food",leakRate:0.11},
  {id:"beverage-manufacturing",name:"Beverage Mfg",icon:"🍺",tier:"growth-business",cat:"Food",leakRate:0.10},
  {id:"senior-care",name:"Senior Care",icon:"👴",tier:"growth-business",cat:"Health",leakRate:0.12},
  {id:"addiction-treatment",name:"Addiction Treatment",icon:"💚",tier:"growth-business",cat:"Health",leakRate:0.11},
  {id:"car-dealership",name:"Car Dealership",icon:"🚗",tier:"growth-business",cat:"Auto",leakRate:0.09},
  {id:"collections-agency",name:"Collections Agency",icon:"💰",tier:"growth-business",cat:"Professional",leakRate:0.08},
  {id:"managed-service-provider",name:"MSP / IT Services",icon:"🖥️",tier:"growth-business",cat:"Tech",leakRate:0.08},
  {id:"cybersecurity",name:"Cybersecurity",icon:"🔒",tier:"growth-business",cat:"Tech",leakRate:0.07},
  {id:"data-analytics",name:"Data Analytics",icon:"📊",tier:"growth-business",cat:"Tech",leakRate:0.07},
  {id:"telecom",name:"Telecom",icon:"📡",tier:"growth-business",cat:"Tech",leakRate:0.09},
  {id:"hotel-motel",name:"Hotel & Motel",icon:"🏨",tier:"growth-business",cat:"Hospitality",leakRate:0.12},
  {id:"private-school",name:"Private School",icon:"🎓",tier:"growth-business",cat:"Education",leakRate:0.09},
  {id:"trucking",name:"Trucking Fleet",icon:"🚛",tier:"growth-business",cat:"Transport",leakRate:0.13,aliases:["trucking company","fleet","transport company","logistics","hauling"]},
  {id:"freight-broker",name:"Freight Broker",icon:"🚛",tier:"growth-business",cat:"Transport",leakRate:0.10},
  {id:"warehousing",name:"Warehousing",icon:"🏭",tier:"growth-business",cat:"Transport",leakRate:0.11},
  {id:"manufacturing",name:"Manufacturing",icon:"🏭",tier:"growth-business",cat:"Industrial",leakRate:0.13},
  {id:"metal-fabrication",name:"Metal Fabrication",icon:"⚙️",tier:"growth-business",cat:"Industrial",leakRate:0.13},
  {id:"textile-apparel",name:"Textile & Apparel",icon:"👕",tier:"growth-business",cat:"Industrial",leakRate:0.12},
  {id:"plastics-rubber",name:"Plastics & Rubber",icon:"🧪",tier:"growth-business",cat:"Industrial",leakRate:0.12},
  {id:"cannabis",name:"Cannabis Production",icon:"🌿",tier:"growth-business",cat:"Industrial",leakRate:0.14},
  {id:"forestry-logging",name:"Forestry & Logging",icon:"🌲",tier:"growth-business",cat:"Agriculture",leakRate:0.13},
  {id:"fishing",name:"Commercial Fishing",icon:"🎣",tier:"growth-business",cat:"Agriculture",leakRate:0.13},
  {id:"mining",name:"Mining",icon:"⛏️",tier:"growth-business",cat:"Agriculture",leakRate:0.11},
  {id:"oil-gas",name:"Oil & Gas",icon:"🛢️",tier:"growth-business",cat:"Agriculture",leakRate:0.10},
  {id:"media-production",name:"Media Production",icon:"🎬",tier:"growth-business",cat:"Creative",leakRate:0.10},
  {id:"publishing",name:"Publishing",icon:"📰",tier:"growth-business",cat:"Creative",leakRate:0.08},
  {id:"staffing-agency",name:"Staffing Agency",icon:"👥",tier:"growth-business",cat:"Services",leakRate:0.10},
  {id:"funeral-home",name:"Funeral Home",icon:"⚱️",tier:"growth-business",cat:"Services",leakRate:0.08},
  {id:"waste-management",name:"Waste Management",icon:"♻️",tier:"growth-business",cat:"Services",leakRate:0.11},
  {id:"wholesale",name:"Wholesale Distribution",icon:"📦",tier:"growth-business",cat:"Distribution",leakRate:0.09},
  {id:"import-export",name:"Import / Export",icon:"🚢",tier:"growth-business",cat:"Distribution",leakRate:0.10},
];

// ─── Helper functions ───────────────────────────────────────────────────────

export function getIndustryById(id: string): Industry | undefined {
  return ALL_INDUSTRIES.find(i => i.id === id);
}

export function getLeakRate(id: string): number {
  return getIndustryById(id)?.leakRate || 0.10;
}

export function getIcon(id: string): string {
  return getIndustryById(id)?.icon || "💼";
}

export function getDisplayName(id: string): string {
  return getIndustryById(id)?.name || id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// Popular picks for quick-select grids (18 most common)
export const POPULAR_INDUSTRIES = ALL_INDUSTRIES.filter(i =>
  ["restaurant","construction","law-firm","ecommerce","healthcare","dental",
   "accounting","real-estate","agency","consulting","saas","personal-trainer",
   "hairstylist-solo","owner-operator-trucker","carpenter","beauty-salon",
   "auto-repair","plumbing"].includes(i.id)
);

// Search industries (includes aliases like "uber" → gig-delivery)
export function searchIndustries(query: string): Industry[] {
  if (!query) return ALL_INDUSTRIES;
  const q = query.toLowerCase();
  return ALL_INDUSTRIES.filter(i =>
    i.name.toLowerCase().includes(q) ||
    i.id.includes(q) ||
    i.cat.toLowerCase().includes(q) ||
    (i.aliases || []).some(a => a.toLowerCase().includes(q))
  );
}

// Get industries grouped by tier
export function getByTier(tier: Industry["tier"]): Industry[] {
  return ALL_INDUSTRIES.filter(i => i.tier === tier);
}
