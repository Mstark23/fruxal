// =============================================================================
// Industry Mapper — Maps free text to industry slugs
// =============================================================================
// "I run a pizza shop" → restaurant
// "I'm a plumber" → plumbing
// "I drive for Uber" → taxi-rideshare
// "I sell clothes online" → ecommerce
// =============================================================================

export interface IndustryMatch {
  slug: string;
  name: string;
  confidence: number; // 0-1
  alternates?: { slug: string; name: string }[];
}

// keyword → slug mapping (most specific first)
const KEYWORD_MAP: [RegExp, string, string][] = [
  // Food & Beverage
  [/uber\s*eats|doordash|skip.*dishes|food\s*delivery/i, "food-delivery", "Food Delivery"],
  [/food\s*truck/i, "food-truck", "Food Truck"],
  [/pizza|sushi|burger|wing|poutine|shawarma|taco|bbq|steak|seafood|diner|bistro|brasserie/i, "restaurant", "Restaurant"],
  [/restaurant|resto|dining|eatery/i, "restaurant", "Restaurant"],
  [/fast\s*food|mcdonald|subway|tim\s*horton|franchise/i, "fast-food-franchise", "Fast Food / Franchise"],
  [/caf[eé]|coffee|espresso|latte|tea\s*shop/i, "cafe-coffee-shop", "Café / Coffee Shop"],
  [/bakery|boulangerie|pastry|bread|cake\s*shop/i, "bakery", "Bakery"],
  [/bar|pub|nightclub|lounge|tavern|brasserie|brewery|taproom/i, "bar-nightclub", "Bar / Nightclub"],
  [/cater/i, "catering", "Catering"],

  // Health & Dental
  [/dentist|dental|orthodont/i, "dental", "Dental Practice"],
  [/optom|eye\s*doctor|vision|optical/i, "optometry", "Optometry"],
  [/chiro/i, "chiropractic", "Chiropractic"],
  [/physio|physical\s*therap/i, "physiotherapy", "Physiotherapy"],
  [/massage\s*therap/i, "massage-therapy", "Massage Therapy"],
  [/mental\s*health|psycholog|psychotherap|counsel/i, "mental-health", "Mental Health"],
  [/medical\s*spa|medspa|med\s*spa|botox|aesthetic/i, "medical-spa", "Medical Spa"],
  [/doctor|clinic|physician|family\s*med|walk.?in|medical/i, "healthcare", "Healthcare"],
  [/pharma/i, "pharmacy", "Pharmacy"],
  [/vet|animal\s*hospital|pet\s*clinic/i, "veterinary", "Veterinary"],
  [/medical\s*lab|lab\s*test/i, "medical-lab", "Medical Lab"],
  [/addiction|rehab|recovery\s*center/i, "addiction-treatment", "Addiction Treatment"],
  [/home\s*care|senior.*care|elder.*care/i, "senior-care", "Senior Care / Home Care"],

  // Beauty
  [/hair\s*salon|beauty\s*salon|coiffeur|coiffure|hairdress/i, "beauty-salon", "Beauty Salon"],
  [/barber/i, "barber-shop", "Barber Shop"],
  [/nail\s*salon|manicure|pedicure|nails/i, "nail-salon", "Nail Salon"],
  [/spa(?!\s*medical)|wellness|relaxation/i, "spa", "Spa"],
  [/tattoo|pierc/i, "tattoo-piercing", "Tattoo / Piercing"],

  // Construction & Trades
  [/general\s*contract|construction|build(?:er|ing)/i, "construction", "Construction"],
  [/roofing|roofer/i, "roofing", "Roofing"],
  [/plumb/i, "plumbing", "Plumbing"],
  [/electri(?:c|cian)/i, "electrical", "Electrical"],
  [/hvac|heat(?:ing)?.*cool|air\s*condition|furnace/i, "hvac", "HVAC"],
  [/paint(?:er|ing)/i, "painting", "Painting"],
  [/demolition|demo\s*company/i, "demolition", "Demolition"],
  [/landscap|lawn\s*care|yard\s*work|snow\s*remov/i, "landscaping", "Landscaping"],

  // Auto
  [/auto.*repair|mechanic|garage|car\s*repair/i, "auto-repair", "Auto Repair"],
  [/auto.*body|collision|bodyshop/i, "auto-body", "Auto Body"],
  [/auto.*detail|car\s*wash|wash/i, "auto-detailing", "Auto Detailing"],
  [/tire\s*shop|tire/i, "tire-shop", "Tire Shop"],
  [/car\s*dealer|used\s*car|auto\s*dealer/i, "car-dealership", "Car Dealership"],
  [/auto.*parts/i, "auto-parts", "Auto Parts"],

  // Transport
  [/uber(?!\s*eats)|lyft|taxi|cab\s*driv|rideshare|ride.?share/i, "taxi-rideshare", "Taxi / Rideshare"],
  [/truck(?:ing|er)|freight|long.?haul|transport(?:ation)?/i, "trucking", "Trucking"],
  [/courier|deliv(?:ery)?(?!\s*app)/i, "courier-delivery", "Courier / Delivery"],
  [/towing|tow\s*truck/i, "towing", "Towing"],
  [/moving\s*company|movers?/i, "moving-company", "Moving Company"],
  [/freight\s*broker/i, "freight-broker", "Freight Broker"],

  // Retail
  [/cloth(?:ing|es)|boutique|fashion|apparel/i, "clothing-boutique", "Clothing Boutique"],
  [/convenience|depanneur|corner\s*store/i, "convenience-store", "Convenience Store"],
  [/grocery|grocer|epicerie|supermarket/i, "grocery", "Grocery Store"],
  [/pet\s*store|pet\s*shop/i, "pet-store", "Pet Store"],
  [/jewel/i, "jewelry-store", "Jewelry Store"],
  [/furniture/i, "furniture-store", "Furniture Store"],
  [/liquor|wine\s*store|beer\s*store|saq/i, "liquor-store", "Liquor Store"],
  [/hardware|home\s*depot|rona/i, "hardware-store", "Hardware Store"],
  [/book\s*store|librairie/i, "bookstore", "Bookstore"],
  [/vape|smoke\s*shop/i, "vape-smoke-shop", "Vape / Smoke Shop"],
  [/flower|flori/i, "florist", "Florist"],
  [/sport.*store|sport.*good/i, "sporting-goods", "Sporting Goods"],
  [/retail|store|shop(?!.*coffee)/i, "retail", "Retail Store"],

  // Professional Services
  [/account(?:ant|ing)|cpa/i, "accounting", "Accounting"],
  [/bookkeep/i, "bookkeeping", "Bookkeeping"],
  [/tax\s*prep|tax\s*return|impot/i, "tax-preparation", "Tax Preparation"],
  [/law(?:yer)?|attorney|legal|notary|avocat/i, "law-firm", "Law Firm"],
  [/consult(?:ant|ing)/i, "consulting", "Consulting"],
  [/financial\s*advis|wealth\s*manage|invest.*advis/i, "financial-advisor", "Financial Advisor"],
  [/insurance\s*(?:broker|agent)/i, "insurance-broker", "Insurance Broker"],
  [/mortgage|hypothe/i, "mortgage-broker", "Mortgage Broker"],
  [/real\s*estate|realtor|courtier|immobilier/i, "real-estate", "Real Estate"],
  [/property\s*manag/i, "property-management", "Property Management"],
  [/architect/i, "architecture", "Architecture"],
  [/engineer/i, "engineering", "Engineering"],
  [/interior\s*design|decorat/i, "interior-design", "Interior Design"],
  [/market(?:ing)?\s*(?:consult|agenc)/i, "marketing-consultant", "Marketing Consultant"],
  [/hr|human\s*resource/i, "hr-consulting", "HR Consulting"],
  [/staffing|recruit|headhunt/i, "staffing-agency", "Staffing Agency"],
  [/translat|interpret/i, "translation", "Translation"],

  // Tech & Creative
  [/web\s*dev|website.*build|wordpress/i, "web-development", "Web Development"],
  [/app\s*dev|mobile\s*app|ios|android\s*dev/i, "app-development", "App Development"],
  [/saas|software.*service|subscription.*software/i, "saas", "SaaS"],
  [/it\s*service|managed\s*service|msp/i, "managed-service-provider", "Managed Service Provider"],
  [/graphic\s*design|logo|brand.*design/i, "graphic-design", "Graphic Design"],
  [/photo(?:graph)/i, "photography", "Photography"],
  [/video.*product|film.*produc|media\s*produc/i, "media-production", "Media Production"],
  [/cyber.*secur/i, "cybersecurity", "Cybersecurity"],
  [/data\s*anal/i, "data-analytics", "Data Analytics"],
  [/freelanc|gig\s*work|contract.*work/i, "freelancer-gig", "Freelancer"],
  [/influenc|content\s*creat|youtube|tiktok.*creator/i, "influencer-creator", "Content Creator"],

  // Education
  [/daycare|garderie|childcare/i, "daycare", "Daycare"],
  [/home.*daycare|home.*childcare|milieu\s*familial/i, "childcare-home", "Home Childcare"],
  [/private\s*school|école\s*privée/i, "private-school", "Private School"],
  [/tutor/i, "tutoring", "Tutoring"],
  [/dance\s*studio|dance\s*school/i, "dance-studio", "Dance Studio"],
  [/music\s*school|music\s*lesson/i, "music-school", "Music School"],
  [/martial\s*art|karate|judo|boxing|mma/i, "martial-arts", "Martial Arts"],
  [/driving\s*school|auto\s*école/i, "driving-school", "Driving School"],
  [/coach|train(?:ing|er)/i, "training-coaching", "Training / Coaching"],

  // Fitness
  [/gym|crossfit|fitness.*center/i, "gym-crossfit", "Gym / CrossFit"],
  [/fitness|workout|exercise/i, "fitness", "Fitness"],
  [/yoga/i, "yoga-studio", "Yoga Studio"],

  // E-commerce
  [/e.?commerce|online\s*store|shopify|amazon\s*sell|sell.*online/i, "ecommerce", "E-Commerce"],
  [/subscription\s*box/i, "subscription-box", "Subscription Box"],
  [/wholesale|distribut/i, "wholesale", "Wholesale"],
  [/import|export/i, "import-export", "Import / Export"],

  // Other
  [/cleaning|clean(?:er)?|maid|femme\s*de\s*ménage/i, "cleaning", "Cleaning"],
  [/janitor/i, "janitorial-commercial", "Janitorial"],
  [/pest\s*control|exterminat/i, "pest-control", "Pest Control"],
  [/dry\s*clean|pressing/i, "dry-cleaning", "Dry Cleaning"],
  [/laundro/i, "laundromat", "Laundromat"],
  [/locksmith|serrur/i, "locksmith", "Locksmith"],
  [/phone\s*repair|screen\s*repair/i, "phone-repair", "Phone Repair"],
  [/computer\s*repair/i, "computer-repair", "Computer Repair"],
  [/security\s*guard|security\s*company/i, "security-guard", "Security Guard"],
  [/hotel|motel/i, "hotel-motel", "Hotel / Motel"],
  [/b\s*&?\s*b|bed.*breakfast|airbnb.*host|gîte/i, "bed-breakfast", "Bed & Breakfast"],
  [/event\s*plan/i, "event-planning", "Event Planning"],
  [/escape\s*room/i, "escape-room", "Escape Room"],
  [/bowling/i, "bowling-alley", "Bowling Alley"],
  [/golf/i, "golf-course", "Golf Course"],
  [/manufactur|factory|usine/i, "manufacturing", "Manufacturing"],
  [/print(?:ing|er|shop)/i, "printing", "Printing"],
  [/cannabis|dispensary|weed/i, "cannabis-retail", "Cannabis Retail"],
  [/nonprofit|non.?profit|charity|organis.*communautaire/i, "nonprofit", "Nonprofit"],
  [/church|religious|mosque|synagogue|temple/i, "church-religious", "Church / Religious"],
  [/farm(?:ing|er)?|agricult/i, "farming", "Farming"],
  [/solar|renewable|energy.*install/i, "solar-energy", "Solar Energy"],
  [/funeral|mort(?:uary|ician)/i, "funeral-home", "Funeral Home"],
  [/warehouse|entrepos/i, "warehousing", "Warehousing"],
];

export function matchIndustry(text: string): IndustryMatch | null {
  const lower = text.toLowerCase().trim();
  if (!lower || lower.length < 2) return null;

  const matches: IndustryMatch[] = [];

  for (const [regex, slug, name] of KEYWORD_MAP) {
    if (regex.test(lower)) {
      matches.push({ slug, name, confidence: 0.9 });
    }
  }

  if (matches.length === 0) return null;
  if (matches.length === 1) return { ...matches[0], confidence: 0.95 };

  // Multiple matches — return best + alternates
  return {
    ...matches[0],
    confidence: 0.8,
    alternates: matches.slice(1, 3),
  };
}

// For the AI to use in its system prompt — all valid industries
export const ALL_INDUSTRIES = KEYWORD_MAP.map(([, slug, name]) => ({ slug, name }))
  .filter((v, i, a) => a.findIndex(x => x.slug === v.slug) === i);
