/**
 * PRESCAN ENGINE V3 - Financial OS Core
 * 
 * This is the heart of the leak detection system.
 * Implements the 4 Phase 1 leaks:
 * 1. processing_rate_high - Card processing fees too high
 * 2. rent_or_chair_high - Rent/chair cost too high
 * 3. tax_optimization_gap - Missing tax deductions (no accounting software)
 * 4. cash_management_risk - Cash handling risk
 */

import { createClient } from '@supabase/supabase-js';
import { 
  calculateFinancialHealthScore, 
  calculateDataHealthScore, 
  calculateBHS, 
  scoreLeakV2,
} from './bhs-engine';
import type { BHSResult } from './bhs-engine';

// ============================================================================
// TYPES
// ============================================================================

export interface PrescanInput {
  businessType: string;           // Raw: "barber", "restaurant", "uber", etc.
  industrySlug: string;            // Normalized: "barber_shop", "restaurant", "rideshare_driver"
  province: string;                // "QC", "ON", etc.
  revenueBand: string;             // "under_100k", "100k_500k", "500k_2m", "2m_plus"
  annualRevenue: number | null;    // Actual number if provided
  paymentMix: string;              // "mostly_cash", "mixed", "mostly_card"
  paymentTools: string[];          // ["bank_terminal", "square", "stripe", etc]
  mainCosts: string[];             // ["rent", "chair_rent", "fuel", "staff", etc]
  employeeCount: number;
  usesAccountingSoftware: boolean;
  tier: 'solo' | 'small' | 'growth';  // Business tier (auto-calculated)
}

export interface Benchmark {
  industry_slug: string;
  province: string;
  metric_key: string;       // base key: 'processing_rate', 'rent_ratio', etc.
  p25: number;
  p50: number;
  p75: number;
  p90: number;
}

export interface AffiliateMatch {
  name: string;
  slug: string;
  description: string;
  website_url: string;
  referral_url: string | null;
  category: string;
  pricing_type: string;
  priority_score: number;
}

export interface DetectedLeak {
  leak_type_code: string;
  estimated_annual_leak: number;
  severity_score: number;
  confidence_score: number;
  priority_score: number;
  detection_confidence: number;
  metadata: Record<string, any>;
  affiliates?: AffiliateMatch[];
}

export interface PrescanTags {
  // Core tags (always present)
  business_type?: string;
  industry_slug?: string;
  province?: string;
  
  // Revenue (can be monthly, annual, or generic)
  set_revenue?: number;
  set_monthly_revenue?: number;
  set_annual_revenue?: number;
  
  // Generic tracking
  uses_accounting?: string; // 'yes' or 'no'
  main_costs?: string; // comma-separated list
  
  // Barber/Salon specific
  ownership?: string; // 'chair_rent' or 'shop_owner'
  chair_rent_amount?: number;
  payment_mix?: string; // 'mostly_cash', 'mixed', 'mostly_card'
  payment_tools?: string; // 'square', 'stripe', 'bank_terminal', etc.
  
  // Rideshare specific
  set_hours_per_week?: number;
  set_weekly_earnings?: number;
  tracks_mileage?: string; // 'yes' or 'no'
  tracks_expenses?: string; // 'yes', 'no', or 'partially'
  car_ownership?: string; // 'own' or 'lease'
  
  // Restaurant specific
  restaurant_type?: string; // 'cafe', 'fast_food', 'sit_down', 'food_truck'
  cuisine?: string;
  set_employee_count?: number;
  employee_structure?: string;
  payment_processor?: string;
  pos_system?: string;
  
  // Trucking specific
  truck_ownership?: string; // 'own' or 'lease'
  expense_tracking?: string; // 'app_name', 'spreadsheet', 'accounting_software', 'manual'
  
  // Construction/Trades specific
  payment_methods?: string; // 'etransfer', 'check', 'card', 'cash'
  tracks_job_costs?: string; // 'yes' or 'no'
  
  // Location
  city?: string;

  // New adaptive prompt tags
  revenue_band?: string;           // 'under_100k', '100k_500k', '500k_1m', '1m_5m', 'over_5m'
  uses_accounting_software?: string; // 'yes', 'no', 'quickbooks', 'wave', etc.
  insurance_status?: string;       // 'never_compared', 'recently_compared', 'original_policy'
  fuel_monthly?: number;
  fleet_size?: number;
  food_cost_pct?: number;
  staffing_count?: number;
  software_tools?: string;         // comma-separated
  contract_review_status?: string;
  multi_location?: string;         // 'yes' or 'no'
  language?: string;               // 'en' or 'fr'

  // High-signal diagnostic fields
  does_rd?: string;                // 'yes' or 'no'
  exports_goods?: string;          // 'yes' or 'no'
  tax_last_reviewed?: string;      // 'this_year', '1_2_years', '3_plus_years', 'never'
  vendor_contracts_stale?: string; // 'yes' or 'no'
  has_business_insurance?: string; // 'yes' or 'no'
  structure?: string;              // 'corporation' or 'sole_proprietor'
}

// ============================================================================
// NORMALIZATION FUNCTIONS
// ============================================================================

/**
 * Normalize business type to industry slug
 */
export function normalizeIndustry(rawType: string): string {
  const n = rawType.toLowerCase().trim();
  
  // ═══════════════════════════════════════════════════════════════
  // INDUSTRY ROUTER
  // Maps any business type to the closest StatCan benchmark set.
  // 8 benchmark categories based on NAICS codes:
  //   barber_shop           → NAICS 81211 (Personal care services)
  //   restaurant            → NAICS 7225  (Food services)
  //   trucking              → NAICS 484   (Freight transport)
  //   rideshare_driver      → NAICS 485   (Passenger ground transit)
  //   construction          → NAICS 238   (Specialty trades)
  //   professional_services → NAICS 541   (Professional/scientific/technical)
  //   retail                → NAICS 445   (Retail trade)
  //   generic_small_business → fallback
  // ═══════════════════════════════════════════════════════════════

  // ── PERSONAL CARE / BEAUTY (→ barber_shop benchmarks) ──
  // Same NAICS 81211 cost structure: high rent, low payroll at solo, tips-based
  const personalCare = [
    'barber', 'barbershop', 'barber shop', 'coiffeur', 'coiffeuse', 'coiffure',
    'salon', 'beauty salon', 'hair salon', 'salon de coiffure',
    'nail', 'nail salon', 'nail tech', 'nails', 'onglerie', 'manucure',
    'esthetician', 'esthétique', 'esthéticienne', 'aesthetics', 'esthetics',
    'spa', 'massage', 'massage therapist', 'massothérapeute', 'massotherapy',
    'lash', 'lash tech', 'eyelash', 'microblading', 'brows', 'eyebrow',
    'tattoo', 'tattoo artist', 'tatoueur', 'tatouage', 'piercing',
    'tanning', 'tanning salon', 'bronzage',
    'waxing', 'épilation', 'hair removal', 'laser hair',
    'makeup', 'makeup artist', 'maquillage', 'maquilleuse',
    'hairstylist', 'hairdresser', 'stylist',
  ];
  if (personalCare.some(k => n.includes(k))) return 'barber_shop';

  // ── FOOD SERVICES (→ restaurant benchmarks) ──
  // NAICS 7225: high COGS (food cost), high labour, thin margins
  const foodService = [
    'restaurant', 'resto', 'bistro', 'brasserie', 'diner',
    'cafe', 'café', 'coffee shop', 'coffee', 'espresso',
    'bakery', 'boulangerie', 'pâtisserie', 'patisserie', 'pastry',
    'bar', 'pub', 'tavern', 'lounge', 'brasserie', 'taproom', 'brewery',
    'food truck', 'food stand', 'cantine', 'canteen',
    'catering', 'traiteur', 'caterer',
    'pizza', 'pizzeria', 'sushi', 'ramen', 'thai', 'indian', 'chinese',
    'burger', 'poutine', 'bagel', 'deli', 'charcuterie',
    'ice cream', 'crèmerie', 'creamery', 'gelato', 'dessert',
    'juice bar', 'smoothie', 'açaí', 'bubble tea', 'boba',
    'fast food', 'quick service', 'takeout', 'take-out',
    'ghost kitchen', 'cloud kitchen', 'dark kitchen',
    'meal prep', 'meal delivery',
    'butcher', 'boucherie', 'poissonnerie', 'fish market',
  ];
  if (foodService.some(k => n.includes(k))) return 'restaurant';

  // ── TRUCKING / FREIGHT (→ trucking benchmarks) ──
  // NAICS 484: fuel-heavy, insurance-heavy, vehicle depreciation
  const trucking = [
    'truck', 'trucking', 'trucker', 'camion', 'camionnage', 'camionneur',
    'freight', 'fret', 'shipping', 'transport', 'transportation',
    'long haul', 'ltl', 'ftl', 'flatbed', 'reefer',
    'moving', 'déménagement', 'mover', 'déménageur',
    'courier', 'livraison', 'delivery driver', 'delivery service',
    'tow truck', 'towing', 'remorquage', 'remorqueuse',
    'dump truck', 'excavation', 'hauling',
    'logistics', 'logistique', 'warehouse', 'entreposage', 'fulfillment',
  ];
  if (trucking.some(k => n.includes(k))) return 'trucking';

  // ── RIDESHARE / PASSENGER TRANSIT (→ rideshare_driver benchmarks) ──
  // NAICS 485: vehicle depreciation, high platform fees, tax complexity
  const rideshare = [
    'uber', 'lyft', 'rideshare', 'ride share', 'ride-share',
    'taxi', 'cab', 'chauffeur',
    'limousine', 'limo', 'shuttle', 'navette',
    'doordash', 'skip the dishes', 'uber eats', 'instacart',
    'delivery app', 'gig driver', 'gig economy', 'gig work',
  ];
  if (rideshare.some(k => n.includes(k))) return 'rideshare_driver';

  // ── CONSTRUCTION / TRADES (→ construction benchmarks) ──
  // NAICS 238: high materials cost, CNESST/CCQ, insurance-heavy
  const construction = [
    'construction', 'contractor', 'entrepreneur général', 'général contractor',
    'renovation', 'rénovation', 'reno', 'réno',
    'plumber', 'plumbing', 'plombier', 'plomberie',
    'electrician', 'electrical', 'électricien', 'électrique',
    'hvac', 'heating', 'cooling', 'ventilation', 'chauffage', 'climatisation',
    'roofing', 'roofer', 'couvreur', 'toiture',
    'painter', 'painting', 'peintre', 'peinture',
    'carpentry', 'carpenter', 'charpentier', 'menuisier', 'menuiserie',
    'mason', 'masonry', 'maçon', 'maçonnerie', 'concrete', 'béton',
    'welder', 'welding', 'soudeur', 'soudure',
    'flooring', 'tile', 'tiling', 'plancher', 'céramique',
    'drywall', 'gypse', 'plâtrier', 'plastering',
    'insulation', 'isolation',
    'landscaping', 'landscaper', 'paysagiste', 'paysagement',
    'snow removal', 'déneigement', 'snow plow',
    'window', 'door', 'fenêtre', 'porte', 'vitrier', 'glazier',
    'pool', 'piscine', 'pool installer',
    'fence', 'clôture', 'fencing',
    'demolition', 'démolition',
    'handyman', 'homme à tout faire', 'jack of all trades',
    'general contractor', 'gc', 'sous-traitant', 'subcontractor',
    'mechanic', 'mécanicien', 'auto repair', 'garage', 'body shop', 'carrosserie',
    'locksmith', 'serrurier',
    'appliance repair', 'réparation',
  ];
  if (construction.some(k => n.includes(k))) return 'construction';

  // ── PROFESSIONAL SERVICES (→ professional_services benchmarks) ──
  // NAICS 541: low COGS, high labour at scale, high profit solo
  const professional = [
    'consulting', 'consultant', 'conseil',
    'accounting', 'accountant', 'comptable', 'comptabilité', 'cpa',
    'bookkeeping', 'bookkeeper', 'tenue de livres',
    'law', 'lawyer', 'attorney', 'avocat', 'avocate', 'law firm', 'legal',
    'notary', 'notaire',
    'architect', 'architecte', 'architecture',
    'engineering', 'engineer', 'ingénieur', 'ingénierie',
    'marketing agency', 'ad agency', 'agence', 'digital agency',
    'web design', 'web developer', 'web development', 'développeur web',
    'graphic design', 'designer', 'design graphique',
    'photography', 'photographer', 'photographe', 'photo studio',
    'videography', 'videographer', 'vidéaste', 'video production',
    'it', 'it services', 'tech', 'technology', 'informatique', 'saas',
    'software', 'developer', 'développeur', 'programmer', 'coding',
    'seo', 'digital marketing', 'social media', 'médias sociaux',
    'copywriter', 'copywriting', 'rédacteur', 'rédaction',
    'translator', 'translation', 'traducteur', 'traduction',
    'coach', 'coaching', 'life coach', 'business coach',
    'tutor', 'tutoring', 'tutorat',
    'therapist', 'therapy', 'psychologist', 'psychologue', 'counsellor',
    'physiotherapy', 'physio', 'physiothérapeute', 'physiothérapie',
    'chiropractor', 'chiropractic', 'chiropraticien', 'chiro',
    'optometrist', 'optométriste', 'optician', 'opticien',
    'dentist', 'dental', 'dentiste', 'dental clinic', 'clinique dentaire',
    'veterinarian', 'vet', 'vétérinaire', 'animal clinic',
    'real estate', 'real estate agent', 'courtier immobilier', 'realtor', 'immobilier',
    'insurance agent', 'insurance broker', 'courtier assurance',
    'financial advisor', 'financial planner', 'planificateur financier',
    'mortgage broker', 'courtier hypothécaire',
    'event planner', 'events', 'événementiel', 'wedding planner',
    'interior design', 'design intérieur', 'décorateur',
    'cleaning', 'cleaning service', 'nettoyage', 'janitorial', 'entretien ménager',
    'property management', 'gestion immobilière',
    'daycare', 'garderie', 'childcare', 'service de garde',
    'security', 'sécurité', 'guard', 'surveillance',
    'staffing', 'recruitment', 'recrutement', 'temp agency',
    'printing', 'imprimerie', 'print shop',
    'education', 'training', 'formation', 'school', 'école',
    'music teacher', 'music lessons', 'cours de musique',
    'dance', 'danse', 'dance studio', 'école de danse',
    'yoga', 'pilates', 'fitness', 'gym', 'personal trainer', 'entraîneur',
    'crossfit', 'martial arts', 'arts martiaux', 'karate', 'boxing',
  ];
  if (professional.some(k => n.includes(k))) return 'professional_services';

  // ── RETAIL (→ retail benchmarks) ──
  // NAICS 445+44: high COGS, razor-thin margins, rent-sensitive
  const retail = [
    'retail', 'store', 'shop', 'magasin', 'boutique',
    'depanneur', 'dépanneur', 'convenience store', 'corner store',
    'grocery', 'épicerie', 'supermarket', 'marché',
    'pharmacy', 'pharmacie', 'drugstore',
    'clothing', 'vêtement', 'fashion', 'mode', 'apparel',
    'shoe', 'chaussure', 'footwear',
    'jewelry', 'bijouterie', 'jeweler', 'bijoutier',
    'flower', 'florist', 'fleuriste', 'floral',
    'pet store', 'animalerie', 'pet shop',
    'hardware', 'quincaillerie', 'tool shop',
    'auto parts', 'pièces auto',
    'electronics', 'électronique', 'computer store',
    'furniture', 'meuble', 'home decor', 'décoration',
    'gift shop', 'souvenir', 'cadeau',
    'toy store', 'jouet',
    'bookstore', 'librairie',
    'thrift', 'friperie', 'consignment', 'second hand', 'vintage',
    'smoke shop', 'vape shop', 'tabac', 'tabagie',
    'dollar store', 'dollarama',
    'ecommerce', 'e-commerce', 'online store', 'online shop', 'shopify',
    'amazon seller', 'etsy', 'marketplace',
    'wholesale', 'distributor', 'distribution', 'grossiste',
    'dispensary', 'cannabis', 'sqdc',
    'optical', 'optique', 'glasses',
    'mattress', 'matelas',
    'sporting goods', 'sport', 'équipement sportif',
    'garden center', 'pépinière', 'nursery',
    'cellphone', 'phone repair', 'réparation cellulaire',
    'reseller', 'reselling', 'resell', 'revendeur', 'revente',
    'dropship', 'dropshipping', 'dropshipper', 'drop ship',
    'flipper', 'flipping', 'flip', 'buy and sell', 'achat-revente',
    'pawn', 'pawn shop', 'prêteur sur gages',
    'liquidation', 'surplus', 'overstock',
    'flea market', 'marché aux puces',
    'ebay', 'amazon seller', 'amazon fba', 'fba',
    'kijiji', 'facebook marketplace',
    'import', 'importer', 'importateur', 'export', 'exporter',
    'vending', 'vending machine', 'distributrice',
  ];
  if (retail.some(k => n.includes(k))) return 'retail';

  // ── AGRICULTURE / FARMING (→ retail benchmarks, closest for product businesses) ──
  const agriculture = [
    'farm', 'ferme', 'farmer', 'agriculteur', 'agriculture',
    'greenhouse', 'serre', 'nursery',
    'maple syrup', 'sirop', 'érablière', 'sugar shack', 'cabane à sucre',
    'vineyard', 'vignoble', 'winery',
    'apiculture', 'bee', 'abeille', 'honey', 'miel',
  ];
  if (agriculture.some(k => n.includes(k))) return 'retail';

  // ── MANUFACTURING (→ construction benchmarks, closest for materials + labour) ──
  const manufacturing = [
    'manufacturing', 'manufacturer', 'fabrication', 'fabricant',
    'factory', 'usine', 'atelier',
    'machine shop', 'cnc', 'machinist',
    'woodworking', 'ébénisterie', 'cabinetry', 'cabinet maker',
    'upholstery', 'rembourrage',
    'sign', 'signage', 'enseigne', 'lettering',
  ];
  if (manufacturing.some(k => n.includes(k))) return 'construction';

  // ── HOSPITALITY (→ restaurant benchmarks, similar cost structure) ──
  const hospitality = [
    'hotel', 'hôtel', 'motel', 'auberge', 'inn', 'b&b', 'bnb',
    'airbnb', 'short term rental', 'location courte durée',
    'campground', 'camping',
  ];
  if (hospitality.some(k => n.includes(k))) return 'restaurant';

  // ── ENTERTAINMENT (→ professional_services benchmarks) ──
  const entertainment = [
    'dj', 'disc jockey', 'musician', 'musicien', 'band',
    'artist', 'artiste', 'art studio',
    'entertainment', 'divertissement',
    'escape room', 'arcade', 'bowling', 'amusement',
    'cinema', 'cinéma', 'theatre', 'théâtre',
  ];
  if (entertainment.some(k => n.includes(k))) return 'professional_services';

  // ── Default fallback ──
  return 'generic_small_business';
}

/**
 * Normalize costs from raw string to array
 */
// ============================================================================
// PROVINCE NORMALIZER
// ============================================================================
export function normalizeProvince(raw: string): string {
  const n = raw.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const map: Record<string, string> = {
    'qc': 'QC', 'quebec': 'QC', 'québec': 'QC', 'qu': 'QC',
    'on': 'ON', 'ontario': 'ON',
    'bc': 'BC', 'british columbia': 'BC', 'colombie-britannique': 'BC', 'colombie britannique': 'BC',
    'ab': 'AB', 'alberta': 'AB',
    'mb': 'MB', 'manitoba': 'MB',
    'sk': 'SK', 'saskatchewan': 'SK',
    'ns': 'NS', 'nova scotia': 'NS', 'nouvelle-ecosse': 'NS', 'nouvelle ecosse': 'NS',
    'nb': 'NB', 'new brunswick': 'NB', 'nouveau-brunswick': 'NB', 'nouveau brunswick': 'NB',
    'pe': 'PE', 'pei': 'PE', 'prince edward island': 'PE', 'ile-du-prince-edouard': 'PE',
    'nl': 'NL', 'newfoundland': 'NL', 'terre-neuve': 'NL',
    'nt': 'NT', 'northwest territories': 'NT', 'territoires du nord-ouest': 'NT',
    'nu': 'NU', 'nunavut': 'NU',
    'yt': 'YT', 'yukon': 'YT',
    // 'canada' alone is ambiguous — fall through to QC default only as last resort
  };
  // If they said 'canada' without a province, don't default to QC
  if (n === 'canada' || n === 'ca') return 'ON'; // neutral — ~40% of Canada's businesses
  return map[n] || (n.length === 2 ? n.toUpperCase() : 'QC');
}

// ============================================================================
// PAYMENT MIX NORMALIZER
// ============================================================================
export function normalizePaymentMix(raw: string): string {
  const n = raw.toLowerCase().trim();
  // App-based, card, digital → no cash handling risk
  if (['mostly_card', 'card', 'carte', 'cards', 'credit', 'debit', 'online', 'en ligne',
       'stripe', 'shopify', 'square', 'clover', 'moneris', 'paypal', 'interac',
       'application', 'app', 'apps', 'uber', 'lyft', 'doordash', 'skip',
       'digital', 'numerique', 'numérique', 'electronique', 'électronique',
       'virement', 'etransfer', 'e-transfer', 'transfer',
       'terminal', 'pos', 'tpv',
  ].some(k => n.includes(k))) return 'mostly_card';
  if (['mostly_cash', 'cash', 'comptant', 'argent', 'especes', 'espèces', 'liquide'].some(k => n.includes(k))) return 'mostly_cash';
  if (['mix', 'mélange', 'melange', 'les deux', 'both', 'moitie', 'moitié', 'half'].some(k => n.includes(k))) return 'mixed';
  return 'unknown'; // No data provided — don't assume payment mix
}

// ============================================================================
// COST NORMALIZER
// ============================================================================
export function normalizeCosts(rawCosts: string): string[] {
  const lower = rawCosts.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const costs: string[] = [];
  
  // Check for each cost type (EN + FR keywords)
  if (lower.includes('rent') || lower.includes('loyer') || lower.includes('local') || lower.includes('bail')) costs.push('rent');
  if (lower.includes('chair') || lower.includes('chaise') || lower.includes('poste')) costs.push('chair_rent');
  if (lower.includes('fuel') || lower.includes('essence') || lower.includes('gas') || lower.includes('diesel') || lower.includes('carburant')) costs.push('fuel');
  if (lower.includes('staff') || lower.includes('employee') || lower.includes('salaire') || lower.includes('payroll') || lower.includes('employe') || lower.includes('personnel') || lower.includes('paie')) costs.push('staff');
  if (lower.includes('insurance') || lower.includes('assurance')) costs.push('insurance');
  if (lower.includes('tools') || lower.includes('equipment') || lower.includes('outils') || lower.includes('equipement') || lower.includes('materiel')) costs.push('tools');
  if (lower.includes('supplies') || lower.includes('fourniture') || lower.includes('inventaire') || lower.includes('inventory') || lower.includes('stock') || lower.includes('marchandise')) costs.push('supplies');
  if (lower.includes('marketing') || lower.includes('advertising') || lower.includes('publicite') || lower.includes('pub') || lower.includes('ads') || lower.includes('facebook') || lower.includes('google ads') || lower.includes('promotion')) costs.push('marketing');
  if (lower.includes('software') || lower.includes('subscription') || lower.includes('saas') || lower.includes('logiciel') || lower.includes('abonnement') || lower.includes('app')) costs.push('subscriptions');
  if (lower.includes('shipping') || lower.includes('expedition') || lower.includes('livraison') || lower.includes('delivery') || lower.includes('transport') || lower.includes('freight') || lower.includes('fret')) costs.push('shipping');
  if (lower.includes('food') || lower.includes('ingredient') || lower.includes('nourriture') || lower.includes('aliment')) costs.push('food_cost');
  
  return costs.length > 0 ? costs : ['other'];
}

// ============================================================================
// TIER DETECTION
// ============================================================================

/**
 * Calculate business tier based on revenue and employees
 * 
 * Tiers:
 * - solo: Solo entrepreneurs (<$100k, 1 person)
 * - small: Small businesses ($100k-$500k OR 2-10 employees)
 * - growth: Growing businesses ($500k+ OR 10+ employees)
 */
export function calculateBusinessTier(
  annualRevenue: number | null,
  employeeCount: number
): 'solo' | 'small' | 'growth' {
  const revenue = annualRevenue ?? 0;

  // Enterprise: $5M+ → handled separately (contingency model)
  // Business tier: $500K+ revenue OR 6+ employees → Business $150/mo
  if (revenue >= 500000 || employeeCount >= 6) {
    return 'growth'; // maps to Business $150/mo dashboard
  }

  // Solo tier: under $500K AND under 6 employees → Solo $49/mo
  return 'solo';
}

/**
 * Get tier pricing (monthly)
 */
export function getTierPricing(tier: 'solo' | 'small' | 'growth'): number {
  const pricing = {
    solo: 49,
    small: 49,
    growth: 150,
  };
  return pricing[tier];
}

/**
 * Build PrescanInput from AI tags (adaptive version)
 */
export function buildPrescanInputFromTags(tags: PrescanTags): PrescanInput {
  const businessType = tags.business_type || 'generic';
  
  // Use industry_slug if provided, otherwise normalize
  const industrySlug = tags.industry_slug || normalizeIndustry(businessType);
  
  // Calculate annual revenue from various sources
  let annualRevenue: number | null = null;
  
  if (tags.set_annual_revenue) {
    annualRevenue = tags.set_annual_revenue;
  } else if (tags.set_revenue) {
    annualRevenue = tags.set_revenue;
  } else if (tags.set_monthly_revenue) {
    annualRevenue = tags.set_monthly_revenue * 12;
  } else if (tags.set_weekly_earnings) {
    // For rideshare drivers with weekly earnings
    annualRevenue = tags.set_weekly_earnings * 52;
  }
  
  // Determine revenue band
  let revenueBand = tags.revenue_band || 'under_100k';
  if (annualRevenue) {
    if (annualRevenue >= 2000000) revenueBand = '2m_plus';
    else if (annualRevenue >= 500000) revenueBand = '500k_2m';
    else if (annualRevenue >= 100000) revenueBand = '100k_500k';
  } else if (tags.revenue_band) {
    // Estimate from band if no exact number
    const bandEstimates: Record<string, number> = {
      'under_100k': 60000, 'under_150k': 100000, '100k_500k': 250000,
      '500k_1m': 750000, '500k_2m': 1000000, '1m_5m': 2500000,
      'over_5m': 7500000, '2m_plus': 3500000,
    };
    annualRevenue = bandEstimates[tags.revenue_band] || 60000;
  }
  
  // Extract payment info (varies by industry)
  const paymentMix = tags.payment_mix ? normalizePaymentMix(tags.payment_mix) : 'unknown';
  // Split comma-separated payment tools (Claude might emit "square, stripe")
  const splitTools = (raw: string) => raw.split(/[,;/]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
  const paymentTools = tags.payment_tools 
    ? splitTools(tags.payment_tools)
    : tags.payment_processor
    ? splitTools(tags.payment_processor)
    : [];
  
  // Extract costs
  const mainCosts: string[] = [];
  if (tags.main_costs) {
    mainCosts.push(...normalizeCosts(tags.main_costs));
  }
  
  // Add industry-specific costs
  if (tags.ownership === 'chair_rent' || tags.chair_rent_amount) {
    mainCosts.push('chair_rent');
  }
  if (tags.truck_ownership === 'lease') {
    mainCosts.push('truck_payment');
  }
  if (tags.main_costs?.includes('fuel') || tags.main_costs?.includes('gas')) {
    mainCosts.push('fuel');
  }
  
  // Employee count
  const employeeCount = (tags.set_employee_count || tags.staffing_count) ?? 0;
  
  // Accounting software usage — handle all language/case variations
  const acctRaw = (
    tags.uses_accounting_software || 
    tags.uses_accounting || 
    ''
  ).toString().toLowerCase().trim();
  
  const usesAccountingSoftware = 
    ['yes', 'oui', 'true', '1', 'quickbooks', 'sage', 'wave', 'xero', 'freshbooks'].some(k => acctRaw.includes(k)) ||
    tags.pos_system !== undefined ||
    tags.expense_tracking?.includes('accounting_software') ||
    false;
  
  // Calculate tier automatically based on revenue and employees
  const tier = calculateBusinessTier(annualRevenue, employeeCount);
  
  return {
    businessType,
    industrySlug,
    province: normalizeProvince(tags.province || 'QC'),
    revenueBand,
    annualRevenue,
    paymentMix,
    paymentTools,
    mainCosts: Array.from(new Set(mainCosts)), // Remove duplicates
    employeeCount,
    usesAccountingSoftware,
    tier,
    // Pass through high-signal tags for conditional detector gating
    taxLastReviewed:       tags.tax_last_reviewed,
    vendorContractsStale:  tags.vendor_contracts_stale,
    insuranceStatus:       tags.insurance_status,
    contractReviewStatus:  tags.contract_review_status,
    softwareTools:         tags.software_tools,
    multiLocation:         tags.multi_location,
  } as any;
}

// ============================================================================
// BENCHMARK LOADING
// ============================================================================

/**
 * Load benchmarks from database for industry + province.
 * DB stores flat rows: processing_rate_p50, processing_rate_p75, etc.
 * We group them into Benchmark objects with p25/p50/p75/p90 properties.
 */
export async function loadBenchmarks(
  supabase: ReturnType<typeof createClient>,
  industrySlug: string,
  province: string
): Promise<Benchmark[]> {
  const benchmarks: Benchmark[] = [];
  
  // Wrap ALL Supabase calls in try/catch — if DB is unavailable,
  // we still return essential fallback benchmarks
  try {
    // ── Step 1: Resolve industry slug → NAICS code ──
    const { data: slugMap } = await (supabase as any)
      .from('naics_industry_map')
      .select('naics_code')
      .eq('industry_slug', industrySlug)
      .limit(1);
    
    const naicsCode = slugMap?.[0]?.naics_code;
    
    // ── Step 2: Load StatCan benchmarks (Tier 1) ──
    let statcan: any = null;
    
    if (naicsCode) {
      const { data } = await (supabase as any)
        .from('statcan_benchmarks')
        .select('*')
        .eq('naics_code', naicsCode)
        .eq('province', province)
        .limit(1);
      statcan = data?.[0];
      
      // Fallback: walk up NAICS hierarchy
      if (!statcan && naicsCode.length > 2) {
        for (let len = naicsCode.length - 1; len >= 2; len--) {
          const parentCode = naicsCode.substring(0, len);
          const { data: parent } = await (supabase as any)
            .from('statcan_benchmarks')
            .select('*')
            .eq('province', province)
            .like('naics_code', parentCode + '%')
            .order('naics_code')
            .limit(1);
          if (parent?.[0]) { statcan = parent[0]; break; }
        }
      }
    }
    
    // ── Step 3: Convert StatCan flat % → Benchmark percentile format ──
    if (statcan) {
      const spread = (avgPct: number) => {
        const dec = avgPct / 100;
        return {
          p25: Math.round(dec * 0.70 * 10000) / 10000,
          p50: Math.round(dec * 10000) / 10000,
          p75: Math.round(dec * 1.30 * 10000) / 10000,
          p90: Math.round(dec * 1.60 * 10000) / 10000,
        };
      };
      
      const columnMap: [string, string][] = [
        ['rent_pct', 'rent_ratio'],
        ['wages_pct', 'payroll_ratio'],
        ['cogs_pct', 'cogs_ratio'],
        ['insurance_pct', 'insurance_cost_ratio'],
        ['advertising_pct', 'marketing_ratio'],
        ['utilities_pct', 'utilities_ratio'],
        ['subcontracts_pct', 'subcontract_ratio'],
        ['net_profit_pct', 'net_profit_ratio'],
      ];
      
      for (const [col, metricKey] of columnMap) {
        const val = statcan[col];
        if (val !== null && val !== undefined && val < 9000) {
          const pct = Number(val);
          if (pct > 0) {
            benchmarks.push({ industry_slug: industrySlug, province, metric_key: metricKey, ...spread(pct) });
          }
        }
      }
      
      // Synthesize rates not in StatCan
      benchmarks.push({ industry_slug: industrySlug, province, metric_key: 'deduction_miss_rate', p25: 0.02, p50: 0.05, p75: 0.10, p90: 0.18 });
      benchmarks.push({ industry_slug: industrySlug, province, metric_key: 'banking_fee_ratio', p25: 0.003, p50: 0.005, p75: 0.010, p90: 0.015 });
      benchmarks.push({ industry_slug: industrySlug, province, metric_key: 'software_cost_ratio', p25: 0.005, p50: 0.010, p75: 0.020, p90: 0.035 });
    }
    
    // ── Step 4: Load published rates (Tier 2) ──
    const { data: pubRates } = await (supabase as any)
      .from('published_rate_benchmarks')
      .select('*')
      .eq('industry_slug', industrySlug);
    
    const { data: universalRates } = await (supabase as any)
      .from('published_rate_benchmarks')
      .select('*')
      .eq('industry_slug', '_universal');
    
    const allRates = [...(pubRates || []), ...(universalRates || [])];
    
    const processingRates = allRates.filter(r => r.rate_type === 'processing' || r.rate_type === 'platform_fee');
    
    if (processingRates.length > 0) {
      const rates = processingRates.map(r => Number(r.rate_value) / 100).sort((a, b) => a - b);
      const avg = rates.reduce((s, r) => s + r, 0) / rates.length;
      benchmarks.push({
        industry_slug: industrySlug, province, metric_key: 'processing_rate',
        p25: Math.max(0.015, avg * 0.8), p50: Math.max(0.020, avg),
        p75: Math.max(0.026, avg * 1.2), p90: Math.max(0.030, avg * 1.5),
      });
    }
    
    // Fuel benchmarks for transport industries
    const fuelIndustries = ['trucking', 'courier', 'moving_company', 'taxi', 'rideshare_driver', 'gig_delivery', 'towing'];
    if (fuelIndustries.includes(industrySlug)) {
      benchmarks.push({ industry_slug: industrySlug, province, metric_key: 'fuel_cost_ratio', p25: 0.15, p50: 0.22, p75: 0.30, p90: 0.38 });
    }
    
  } catch (dbError: any) {
    console.error('⚠️ loadBenchmarks DB error (falling back to essentials):', dbError?.message);
  }
  
  // ── Step 5: ALWAYS ensure essential benchmarks exist ──
  // This runs regardless of whether Supabase calls succeeded or failed
  const essentialKeys = [
    { metric_key: 'rent_ratio', p25: 0.04, p50: 0.07, p75: 0.12, p90: 0.18 },
    { metric_key: 'payroll_ratio', p25: 0.15, p50: 0.25, p75: 0.35, p90: 0.45 },
    { metric_key: 'cogs_ratio', p25: 0.20, p50: 0.35, p75: 0.50, p90: 0.65 },
    { metric_key: 'insurance_cost_ratio', p25: 0.01, p50: 0.02, p75: 0.04, p90: 0.06 },
    { metric_key: 'deduction_miss_rate', p25: 0.02, p50: 0.05, p75: 0.10, p90: 0.18 },
    { metric_key: 'banking_fee_ratio', p25: 0.003, p50: 0.005, p75: 0.010, p90: 0.015 },
    { metric_key: 'software_cost_ratio', p25: 0.005, p50: 0.010, p75: 0.020, p90: 0.035 },
    { metric_key: 'processing_rate', p25: 0.015, p50: 0.023, p75: 0.029, p90: 0.035 },
    { metric_key: 'marketing_ratio', p25: 0.01, p50: 0.03, p75: 0.06, p90: 0.10 },
    { metric_key: 'inventory_ratio', p25: 0.05, p50: 0.10, p75: 0.18, p90: 0.25 },
  ];
  
  for (const essential of essentialKeys) {
    if (!benchmarks.find(b => b.metric_key === essential.metric_key)) {
      benchmarks.push({
        industry_slug: industrySlug || 'generic',
        province,
        ...essential,
      });
    }
  }
  
  return benchmarks;
}

// ============================================================================
// LEAK DETECTION - INDIVIDUAL LEAKS
// ============================================================================

/**
 * LEAK 1: Card Processing Rate Too High
 */
function detectProcessingLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  // Only flag if payment data was explicitly provided by user
  // Default 'mixed' = no data given — don't assume a leak
  if (!input.paymentMix || input.paymentMix === 'unknown') return null;
  if (input.paymentMix === 'mostly_cash') return null;
  if (!input.annualRevenue) return null;
  
  // Get processing rate benchmark
  const procBenchmark = benchmarks.find(b => b.metric_key === 'processing_rate');
  if (!procBenchmark) return null;
  
  // Estimate card volume based on payment mix
  const cardShare = input.paymentMix === 'mostly_card' ? 0.8 :
                    input.paymentMix === 'mixed' ? 0.5 : 0.2;
  const cardVolume = input.annualRevenue * cardShare;
  
  // Estimate user's rate based on tools
  // Values are already decimals (0.026 = 2.6%)
  let assumedRate = procBenchmark.p75; // Default to 75th percentile
  if (input.paymentTools.some(t => ['square', 'stripe', 'shopify', 'shopify payments', 'paypal'].includes(t.toLowerCase()))) {
    assumedRate = procBenchmark.p75; // Platform processors are typically at p75
  } else if (input.paymentTools.some(t => ['bank_terminal', 'bank', 'moneris', 'desjardins', 'td', 'rbc', 'bmo', 'clover', 'global payments'].includes(t.toLowerCase()))) {
    assumedRate = procBenchmark.p50; // Bank terminals closer to p50
  }
  
  // Target rate (p50 = best negotiated rate for their type)
  const targetRate = procBenchmark.p50;
  
  // Calculate leak
  const deltaRate = Math.max(0, assumedRate - targetRate);
  const estimatedLeak = cardVolume * deltaRate;
  
  // Ignore if too small
  if (estimatedLeak < 300) return null;
  
  // Calculate scores
  const impactScore = calculateImpactScore(estimatedLeak);
  const deviationScore = calculateDeviationScore(
    assumedRate,
    procBenchmark.p50,
    procBenchmark.p90 || procBenchmark.p75
  );
  const persistenceScore = 20; // Prescan default
  
  const severity = 0.5 * impactScore + 0.3 * deviationScore + 0.2 * persistenceScore;
  const rawConfidence = 55; // Medium confidence for prescan
  const dataHealth = 50; // Limited data in prescan
  const confidence = rawConfidence * (dataHealth / 100);
  
  return {
    leak_type_code: 'processing_rate_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      assumed_rate_pct: (assumedRate * 100).toFixed(2),
      target_rate_pct: (targetRate * 100).toFixed(2),
      card_volume: Math.round(cardVolume),
      benchmark_p50: procBenchmark.p50,
      benchmark_p75: procBenchmark.p75,
    }
  };
}

/**
 * LEAK 2: Rent or Chair Cost Too High
 */
function detectRentLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  // Only check if they mentioned rent/chair as a cost
  if (!input.mainCosts.includes('rent') && !input.mainCosts.includes('chair_rent')) {
    return null;
  }
  if (!input.annualRevenue) return null;
  
  // Get rent ratio benchmark (chair or regular rent)
  const isChairRent = input.mainCosts.includes('chair_rent');
  const metricKey = isChairRent ? 'chair_rent_ratio' : 'rent_ratio';
  let rentBenchmark = benchmarks.find(b => b.metric_key === metricKey);
  
  // Fallback to rent_ratio if chair_rent_ratio not found
  if (!rentBenchmark && isChairRent) {
    rentBenchmark = benchmarks.find(b => b.metric_key === 'rent_ratio');
  }
  if (!rentBenchmark) return null;
  
  // Use tier-specific quartile as assumed, p25 as target (best performers)
  // SOLO→p75 (worst), SMALL→p50, GROWTH→p25 (they should be optimized)
  const assumedRatio = input.tier === 'solo' ? rentBenchmark.p75 :
                       input.tier === 'small' ? rentBenchmark.p50 :
                       rentBenchmark.p25;
  const targetRatio = rentBenchmark.p25 || rentBenchmark.p50;
  
  const deltaRatio = Math.max(0, assumedRatio - targetRatio);
  const estimatedLeak = input.annualRevenue * deltaRatio;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const deviationScore = calculateDeviationScore(
    assumedRatio,
    rentBenchmark.p25 || rentBenchmark.p50,
    rentBenchmark.p75
  );
  const persistenceScore = 20;
  
  const severity = 0.5 * impactScore + 0.3 * deviationScore + 0.2 * persistenceScore;
  const rawConfidence = 50;
  const dataHealth = 50;
  const confidence = rawConfidence * (dataHealth / 100);
  
  return {
    leak_type_code: 'rent_or_chair_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      cost_type: isChairRent ? 'chair_rent' : 'rent',
      assumed_ratio_pct: (assumedRatio * 100).toFixed(1),
      target_ratio_pct: (targetRatio * 100).toFixed(1),
      benchmark_p50: rentBenchmark.p50,
      benchmark_p75: rentBenchmark.p75,
    }
  };
}

/**
 * LEAK 3: Tax Optimization Gap
 * Trigger: usesAccountingSoftware = false AND annualRevenue >= 30000
 * tau = deduction_miss_rate_p50 (use p75 if no software AND no accountant)
 */
function detectTaxLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.usesAccountingSoftware) return null;
  if (!input.annualRevenue || input.annualRevenue < 30000) return null;
  // Boost confidence if they do R&D — SR&ED credits are commonly missed
  const doesRD = (input as any).doesRD === 'yes';
  
  const bench = benchmarks.find(b => b.metric_key === 'deduction_miss_rate');
  // Use p75 (worst case) if no software, p50 if they have some tracking
  const tau = bench ? bench.p75 : 0.04;
  const estimatedLeak = input.annualRevenue * tau;
  
  if (estimatedLeak < 200) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.7 * impactScore + 0.3 * 20;
  const confidence = 70 * (50 / 100);
  
  return {
    leak_type_code: 'tax_optimization_gap',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      miss_rate_pct: (tau * 100).toFixed(1),
      revenue: input.annualRevenue,
    }
  };
}

/**
 * LEAK 4: Payroll Too High
 * Trigger: employeeCount > 0
 * payroll_assumed = ratio for tier quartile, payroll_target = p25
 */
function detectPayrollLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.employeeCount <= 0) return null;
  if (!input.annualRevenue) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'payroll_ratio');
  if (!bench) return null;
  
  // Solo → assume p75 (worst performers); growth → assume p50 (average)
  const assumed = input.tier === 'solo' ? bench.p75 : bench.p50;
  const target  = bench.p25 || bench.p50;

  const delta = Math.max(0, assumed - target);
  const estimatedLeak = input.annualRevenue * delta;

  if (estimatedLeak < 500) return null;

  const impactScore    = calculateImpactScore(estimatedLeak);
  const deviationScore = calculateDeviationScore(assumed, bench.p25, bench.p75);
  const severity = 0.5 * impactScore + 0.3 * deviationScore + 0.2 * 20;
  const confidence = 55 * (50 / 100);

  return {
    leak_type_code: 'payroll_ratio_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      assumed_ratio_pct: (assumed * 100).toFixed(1),
      target_ratio_pct: (target * 100).toFixed(1),
      employee_count: input.employeeCount,
    }
  };
}

/**
 * LEAK 5: Insurance Overpayment
 * Trigger: mainCosts includes insurance OR insurance_status = never_compared
 */
function detectInsuranceLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  // Fire if insurance is a stated cost OR if insurance_status indicates it's not been reviewed
  const hasInsuranceCost = input.mainCosts.includes('insurance');
  const insuranceNotReviewed = (input as any).insuranceStatus === 'never_compared' || (input as any).insuranceStatus === 'original_policy';
  if (!hasInsuranceCost && !insuranceNotReviewed) return null;
  if (!input.annualRevenue) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'insurance_cost_ratio');
  if (!bench) return null;
  
  const assumed = input.tier === 'solo' ? bench.p75 :
                  input.tier === 'small' ? bench.p50 :
                  bench.p75;
  const target = bench.p25 || bench.p50;
  
  const delta = Math.max(0, assumed - target);
  const estimatedLeak = input.annualRevenue * delta;
  
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const deviationScore = calculateDeviationScore(assumed, bench.p25, bench.p75);
  const severity = 0.5 * impactScore + 0.3 * deviationScore + 0.2 * 20;
  const confidence = 50 * (50 / 100);
  
  return {
    leak_type_code: 'insurance_overpayment',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      assumed_ratio_pct: (assumed * 100).toFixed(1),
      target_ratio_pct: (target * 100).toFixed(1),
    }
  };
}

/**
 * LEAK 6: Fuel / Vehicle Costs Too High
 * Trigger: mainCosts includes fuel, vehicle, fleet, gas, diesel
 */
function detectFuelLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.mainCosts.some(c => ['fuel', 'vehicle', 'fleet', 'gas', 'diesel'].includes(c))) return null;
  if (!input.annualRevenue) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'fuel_cost_ratio');
  if (!bench) return null;
  
  let actualRatio: number;
  const fuelMonthly = (input as any).fuelMonthly;
  if (fuelMonthly && fuelMonthly > 0) {
    actualRatio = (fuelMonthly * 12) / input.annualRevenue;
  } else {
    actualRatio = input.tier === 'solo' ? bench.p75 :
                  input.tier === 'small' ? bench.p50 :
                  bench.p75;
  }
  
  const target = bench.p25 || bench.p50;
  const delta = Math.max(0, actualRatio - target);
  const estimatedLeak = input.annualRevenue * delta;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const deviationScore = calculateDeviationScore(actualRatio, bench.p25, bench.p75);
  const severity = 0.5 * impactScore + 0.3 * deviationScore + 0.2 * 20;
  const confidence = 50 * (50 / 100);
  
  return {
    leak_type_code: 'fuel_vehicle_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      actual_ratio_pct: (actualRatio * 100).toFixed(1),
      target_ratio_pct: (target * 100).toFixed(1),
    }
  };
}

/**
 * LEAK 7: Software / Subscription Bloat
 * Trigger: tier = SMALL or GROWTH, non-vehicle business
 */
function detectSoftwareLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.tier === 'solo') return null;
  if (!input.annualRevenue) return null;
  // Require either explicit software cost mention OR softwareTools tag
  const hasSoftwareCost = input.mainCosts.includes('subscriptions') || (input as any).softwareTools;
  if (!hasSoftwareCost) return null;
  const bench = benchmarks.find(b => b.metric_key === 'software_cost_ratio');
  if (!bench) return null;
  
  const delta = Math.max(0, bench.p75 - (bench.p25 || bench.p50));
  const estimatedLeak = input.annualRevenue * delta;
  
  if (estimatedLeak < 200) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 30 + 0.2 * 20;
  const confidence = 45 * (50 / 100);
  
  return {
    leak_type_code: 'software_bloat',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      p75_pct: (bench.p75 * 100).toFixed(1),
      p25_pct: ((bench.p25 || bench.p50) * 100).toFixed(1),
    }
  };
}

/**
 * LEAK 8: Inventory / COGS Too High
 * Trigger: business sells physical goods or food
 */
function detectInventoryLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'cogs_ratio');
  if (!bench) return null;
  
  const foodCostPct = (input as any).foodCostPct;
  
  // Only fire if we have ACTUAL user data (food_cost_pct from Q&A)
  // Without real data, this detector produces absurd numbers (p75 vs p25 = huge delta)
  if (!foodCostPct || foodCostPct <= 0) return null;
  
  const actualRatio = foodCostPct / 100; // User gives percentage like 35
  const target = bench.p25;
  const delta = Math.max(0, actualRatio - target);
  const estimatedLeak = input.annualRevenue * delta;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const deviationScore = calculateDeviationScore(actualRatio, bench.p25, bench.p75);
  const severity = 0.5 * impactScore + 0.3 * deviationScore + 0.2 * 20;
  const confidence = 50 * (50 / 100);
  
  return {
    leak_type_code: 'inventory_cogs_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      actual_ratio_pct: (actualRatio * 100).toFixed(1),
      target_ratio_pct: (target * 100).toFixed(1),
    }
  };
}

/**
 * LEAK 9: Banking Fees Too High
 * Trigger: tier = SMALL or GROWTH
 */
function detectBankingLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.tier === 'solo') return null;
  if (!input.annualRevenue) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'banking_fee_ratio');
  if (!bench) return null;
  
  const delta = Math.max(0, bench.p75 - (bench.p25 || bench.p50));
  let estimatedLeak = input.annualRevenue * delta;
  if (input.tier === 'growth') estimatedLeak *= 1.5;
  
  if (estimatedLeak < 200) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 30 + 0.2 * 20;
  const confidence = 45 * (50 / 100);
  
  return {
    leak_type_code: 'banking_fees_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      p75_pct: (bench.p75 * 100).toFixed(1),
      p25_pct: ((bench.p25 || bench.p50) * 100).toFixed(1),
    }
  };
}

/**
 * LEAK 10: Marketing Waste
 * Trigger: tier = GROWTH or marketing spend mentioned
 */
function detectMarketingLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  // Only fire if user explicitly mentioned marketing as a cost — don't auto-assume
  if (!input.mainCosts.includes('marketing')) return null;
  if (!input.annualRevenue) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'marketing_ratio');
  if (!bench) return null;
  
  const delta = Math.max(0, bench.p75 - (bench.p25 || bench.p50));
  const estimatedLeak = input.annualRevenue * delta;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 30 + 0.2 * 20;
  const confidence = 40 * (50 / 100);
  
  return {
    leak_type_code: 'marketing_waste',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: {
      p75_pct: (bench.p75 * 100).toFixed(1),
      p25_pct: ((bench.p25 || bench.p50) * 100).toFixed(1),
    }
  };
}

// ============================================================================
// LEAK 11: Cash Shrinkage (cash-heavy businesses)
// ============================================================================
function detectCashShrinkage(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.paymentMix !== 'mostly_cash' && input.paymentMix !== 'mixed') return null;
  if (!input.annualRevenue) return null;
  
  const cashShare = input.paymentMix === 'mostly_cash' ? 0.75 : 0.40;
  const cashVolume = input.annualRevenue * cashShare;
  // Industry data: cash businesses lose 2-4% to errors, miscounts, theft
  const shrinkRate = input.tier === 'solo' ? 0.03 : 0.02;
  const estimatedLeak = cashVolume * shrinkRate;
  
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 25 + 0.2 * 20;
  const confidence = 40 * (50 / 100);
  
  return {
    leak_type_code: 'cash_shrinkage',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { cash_volume: Math.round(cashVolume), shrink_rate_pct: (shrinkRate * 100).toFixed(1), cash_share_pct: (cashShare * 100).toFixed(0) }
  };
}

// ============================================================================
// LEAK 12: Utilities Overspend
// ============================================================================
function detectUtilitiesLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 50000) return null;
  // Only for businesses with physical locations
  if (!input.mainCosts.some(c => ['rent', 'chair_rent', 'utilities', 'electricity', 'hydro', 'heating'].includes(c))) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'utilities_ratio');
  if (!bench) {
    // Use default: businesses typically spend 2-4% on utilities
    const assumed = input.tier === 'solo' ? 0.035 : 0.025;
    const target = 0.018;
    const estimatedLeak = input.annualRevenue * Math.max(0, assumed - target);
    if (estimatedLeak < 300) return null;
    
    const impactScore = calculateImpactScore(estimatedLeak);
    return {
      leak_type_code: 'utilities_overspend',
      estimated_annual_leak: Math.round(estimatedLeak),
      severity_score: Math.round(0.5 * impactScore + 0.3 * 20 + 0.2 * 15),
      confidence_score: 18,
      priority_score: Math.round((0.5 * impactScore + 0.3 * 20 + 0.2 * 15) * 18 / 100),
      detection_confidence: 0.18,
      metadata: { assumed_pct: (assumed * 100).toFixed(1), target_pct: (target * 100).toFixed(1) }
    };
  }
  
  const delta = Math.max(0, bench.p75 - bench.p25);
  const estimatedLeak = input.annualRevenue * delta;
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 35 * (50 / 100);
  
  return {
    leak_type_code: 'utilities_overspend',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { bench_p25_pct: (bench.p25 * 100).toFixed(1), bench_p75_pct: (bench.p75 * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 13: Revenue Underpricing (not adjusting for inflation)
// ============================================================================
function detectRevenuePricingLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue) return null;
  // Only flag if user indicated they haven't reviewed pricing recently
  // If tax was reviewed this year, assume pricing was too
  if ((input as any).taxLastReviewed === 'this_year') return null;
  const inflationGap = input.tier === 'solo' ? 0.03 : 0.02;
  const estimatedLeak = input.annualRevenue * inflationGap;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 30 * (50 / 100);
  
  return {
    leak_type_code: 'revenue_underpricing',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { inflation_gap_pct: (inflationGap * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 14: Accounts Receivable Leakage (service businesses with invoicing)
// ============================================================================
function detectReceivablesLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 50000) return null;
  // Service businesses that invoice are most at risk
  const serviceTypes = ['consulting', 'professional_services', 'construction', 'contractor', 'freelance', 'agency', 'marketing_agency', 'design', 'web_development', 'accounting', 'legal'];
  const isService = serviceTypes.some(t => input.industrySlug.includes(t) || input.businessType.toLowerCase().includes(t));
  // Only fire for known service businesses — don't assume invoicing for mixed-payment retail
  if (!isService) return null;
  
  // 5-8% of invoiced revenue is typically collected late or written off
  const writeOffRate = input.tier === 'solo' ? 0.05 : 0.03;
  const invoicedShare = isService ? 0.7 : 0.3;
  const estimatedLeak = input.annualRevenue * invoicedShare * writeOffRate;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 30 + 0.2 * 20;
  const confidence = 30 * (50 / 100);
  
  return {
    leak_type_code: 'receivables_leakage',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { write_off_rate_pct: (writeOffRate * 100).toFixed(1), invoiced_share_pct: (invoicedShare * 100).toFixed(0) }
  };
}

// ============================================================================
// LEAK 15: Late Payment Penalties
// ============================================================================
function detectLatePaymentLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 80000) return null;
  if (input.usesAccountingSoftware) return null; // Software tracks due dates
  if (input.tier === 'solo') return null; // Solo typically pays directly, less exposure
  
  // Without tracking, businesses average $500-2000/yr in late fees (suppliers, taxes, utilities)
  const lateRate = (input.tier as string) === 'solo' ? 0.005 : 0.003;
  const estimatedLeak = input.annualRevenue * lateRate;
  
  if (estimatedLeak < 200) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 35 * (50 / 100);
  
  return {
    leak_type_code: 'late_payment_penalties',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { late_rate_pct: (lateRate * 100).toFixed(2) }
  };
}

// ============================================================================
// LEAK 16: Equipment Depreciation (CCA not claimed properly)
// ============================================================================
function detectEquipmentLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 50000) return null;
  if (input.usesAccountingSoftware) return null;
  
  // Industries with significant equipment
  const equipmentIndustries = ['construction', 'trucking', 'restaurant', 'barber_shop', 'salon', 'gym', 'fitness', 'manufacturing', 'auto_repair', 'mechanic', 'landscaping', 'cleaning', 'printing', 'photography'];
  const hasEquipment = equipmentIndustries.some(t => input.industrySlug.includes(t) || input.businessType.toLowerCase().includes(t));
  if (!hasEquipment && !input.mainCosts.some(c => ['equipment', 'tools', 'machinery'].includes(c))) return null;
  
  // CCA deduction typically 1-3% of revenue for equipment-heavy businesses
  const ccaGap = 0.015;
  const estimatedLeak = input.annualRevenue * ccaGap;
  
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 25 * (50 / 100);
  
  return {
    leak_type_code: 'equipment_depreciation_gap',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { cca_gap_pct: (ccaGap * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 17: Employee Turnover Cost
// ============================================================================
function detectTurnoverLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.employeeCount < 3) return null;
  if (!input.annualRevenue) return null;
  
  // Average turnover in Canadian SMBs: ~20%/yr. Cost per replacement: 30-50% of annual salary
  const avgSalary = input.annualRevenue * 0.06; // rough per-employee estimate
  const turnoverRate = 0.20;
  const replacementCost = 0.35; // 35% of salary per replacement
  const estimatedLeak = input.employeeCount * turnoverRate * avgSalary * replacementCost;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 25 + 0.2 * 20;
  const confidence = 25 * (50 / 100);
  
  return {
    leak_type_code: 'employee_turnover_cost',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { employee_count: input.employeeCount, turnover_rate_pct: '20', replacement_cost_pct: '35' }
  };
}

// ============================================================================
// LEAK 18: Supplier Discount Missed
// ============================================================================
function detectSupplierDiscountLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 100000) return null;
  if (input.tier === 'solo') return null;
  // Only flag if user explicitly mentioned inventory/supply/material costs
  if (!input.mainCosts.some(c => ['inventory', 'supplies', 'food', 'food_cost', 'materials', 'goods'].includes(c))) return null;
  
  const cogsRatio = 0.35; // They mentioned COGS explicitly
  const missedDiscount = 0.02; // 2% early-pay discount typically available
  const estimatedLeak = input.annualRevenue * cogsRatio * missedDiscount;
  
  if (estimatedLeak < 400) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 25 * (50 / 100);
  
  return {
    leak_type_code: 'supplier_discount_missed',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { cogs_ratio_pct: (cogsRatio * 100).toFixed(0), discount_pct: (missedDiscount * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 19: Debt Interest Optimization
// ============================================================================
function detectDebtInterestLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 150000) return null;
  // Only flag for growth+ tier — solo businesses rarely have business credit facilities
  if (input.tier === 'solo') return null;
  // Most SMBs carry some business debt (LOC, equipment loan, credit card float)
  // Average business debt: 15-25% of annual revenue
  const debtRatio = (input.tier as string) === 'solo' ? 0.15 : 0.22;
  const estimatedDebt = input.annualRevenue * debtRatio;
  // Rate optimization gap: 2-3% rate difference between best and worst SMB rates
  const rateGap = 0.025;
  const estimatedLeak = estimatedDebt * rateGap;
  
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 20 * (50 / 100);
  
  return {
    leak_type_code: 'debt_interest_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { estimated_debt: Math.round(estimatedDebt), rate_gap_pct: (rateGap * 100).toFixed(1), debt_ratio_pct: (debtRatio * 100).toFixed(0) }
  };
}

// ============================================================================
// LEAK 20: GST/HST Filing Inefficiency
// ============================================================================
function detectTaxFilingLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 100000) return null;
  if (input.usesAccountingSoftware) return null;
  if (input.tier === 'solo') return null; // Already covered by detectTaxLeak
  
  // Without proper ITCs tracking, businesses lose 1-2% to unclaimed input tax credits
  const itcLossRate = (input.tier as string) === 'solo' ? 0.015 : 0.01;
  const estimatedLeak = input.annualRevenue * itcLossRate;
  
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 25 + 0.2 * 15;
  const confidence = 35 * (50 / 100);
  
  return {
    leak_type_code: 'tax_filing_inefficiency',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { itc_loss_rate_pct: (itcLossRate * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 21: Professional Fees Bloat
// ============================================================================
function detectProfessionalFeesLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 200000) return null;
  if (input.tier === 'solo') return null; // Solo rarely overpays on professional fees
  
  // Most businesses don't shop accountant/lawyer fees. Overpayment: 0.5-1% of revenue
  const feeOverpay = input.tier === 'growth' ? 0.008 : 0.005;
  const estimatedLeak = input.annualRevenue * feeOverpay;
  
  if (estimatedLeak < 400) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 15 + 0.2 * 15;
  const confidence = 20 * (50 / 100);
  
  return {
    leak_type_code: 'professional_fees_high',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { overpay_pct: (feeOverpay * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 22: No Bookkeeping System (compound leak)
// ============================================================================
function detectBookkeepingGapLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.usesAccountingSoftware) return null;
  if (!input.annualRevenue || input.annualRevenue < 60000) return null;
  // Don't double-count with detectTaxLeak — only add if growth tier
  if (input.tier === 'solo') return null;
  
  // Businesses without bookkeeping systems: lost receipts, missed expenses, duplicate payments
  // Compound effect: 1-3% of revenue
  const gapRate = (input.tier as string) === 'solo' ? 0.02 : 0.015;
  const estimatedLeak = input.annualRevenue * gapRate;
  
  if (estimatedLeak < 400) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 30 + 0.2 * 20;
  const confidence = 40 * (50 / 100);
  
  return {
    leak_type_code: 'no_bookkeeping_system',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { gap_rate_pct: (gapRate * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 23: Subcontractor Markup Gap
// ============================================================================
function detectSubcontractorLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 100000) return null;
  
  const subIndustries = ['construction', 'contractor', 'renovation', 'plumbing', 'electrical', 'hvac', 'roofing', 'general_contractor'];
  const usesSubs = subIndustries.some(t => input.industrySlug.includes(t) || input.businessType.toLowerCase().includes(t));
  if (!usesSubs) return null;
  
  const bench = benchmarks.find(b => b.metric_key === 'subcontract_ratio');
  if (!bench) {
    // Default: subcontracting costs average 15-25% for construction
    const delta = 0.04; // typical optimization gap
    const estimatedLeak = input.annualRevenue * delta;
    if (estimatedLeak < 500) return null;
    
    const impactScore = calculateImpactScore(estimatedLeak);
    return {
      leak_type_code: 'subcontractor_markup',
      estimated_annual_leak: Math.round(estimatedLeak),
      severity_score: Math.round(0.5 * impactScore + 0.3 * 25 + 0.2 * 20),
      confidence_score: 15,
      priority_score: Math.round((0.5 * impactScore + 0.3 * 25 + 0.2 * 20) * 15 / 100),
      detection_confidence: 0.15,
      metadata: { delta_pct: '4.0' }
    };
  }
  
  const delta = Math.max(0, bench.p75 - bench.p25);
  const estimatedLeak = input.annualRevenue * delta;
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 25 + 0.2 * 20;
  const confidence = 25 * (50 / 100);
  
  return {
    leak_type_code: 'subcontractor_markup',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { bench_p25_pct: (bench.p25 * 100).toFixed(1), bench_p75_pct: (bench.p75 * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 24: Scheduling / Overtime Inefficiency
// ============================================================================
function detectSchedulingLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (input.employeeCount < 2) return null;
  if (!input.annualRevenue) return null;
  
  // Poor scheduling leads to overtime premiums and understaffing losses
  // Estimated: 1-2% of revenue for businesses with employees
  const schedRate = input.employeeCount >= 10 ? 0.02 : 0.012;
  const estimatedLeak = input.annualRevenue * schedRate;
  
  if (estimatedLeak < 500) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 20 + 0.2 * 15;
  const confidence = 25 * (50 / 100);
  
  return {
    leak_type_code: 'scheduling_inefficiency',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { employee_count: input.employeeCount, sched_rate_pct: (schedRate * 100).toFixed(1) }
  };
}

// ============================================================================
// LEAK 25: No Emergency Fund Buffer (reactive cost management)
// ============================================================================
function detectEmergencyFundLeak(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak | null {
  if (!input.annualRevenue || input.annualRevenue < 50000) return null;
  
  // Without reserves, businesses pay premium rates for emergency repairs, rush orders, short-term credit
  // Estimated reactive premium: 0.5-1.5% of revenue
  const reactiveRate = input.tier === 'solo' ? 0.012 : 0.006;
  const estimatedLeak = input.annualRevenue * reactiveRate;
  
  if (estimatedLeak < 300) return null;
  
  const impactScore = calculateImpactScore(estimatedLeak);
  const severity = 0.5 * impactScore + 0.3 * 15 + 0.2 * 15;
  const confidence = 20 * (50 / 100);
  
  return {
    leak_type_code: 'no_emergency_fund',
    estimated_annual_leak: Math.round(estimatedLeak),
    severity_score: Math.round(severity),
    confidence_score: Math.round(confidence),
    priority_score: Math.round((severity * confidence) / 100),
    detection_confidence: confidence / 100,
    metadata: { reactive_rate_pct: (reactiveRate * 100).toFixed(1) }
  };
}

// ============================================================================
// SCORING HELPERS
// ============================================================================

/**
 * Impact score from leak amount (Section 9 of handoff)
 */
function calculateImpactScore(amount: number): number {
  if (amount < 500) return 10;
  if (amount < 1500) return 30;
  if (amount < 5000) return 60;
  if (amount < 15000) return 80;
  return 100;
}

/**
 * Deviation score: how far from best performers (p25)
 * clamp((user_ratio - p25) / (p75 - p25), 0, 1) × 100
 */
function calculateDeviationScore(actual: number, p25: number, p75: number): number {
  if (!p25 || !p75 || p75 === p25) return 50;
  if (actual <= p25) return 0;
  const ratio = Math.min(1, (actual - p25) / (p75 - p25));
  return ratio * 100;
}

// ============================================================================
// MAIN DETECTION ORCHESTRATOR
// ============================================================================

/**
 * Detect all leaks for a prescan input — runs all 10 detectors
 */
export function detectLeaks(
  input: PrescanInput,
  benchmarks: Benchmark[]
): DetectedLeak[] {
  const leaks: DetectedLeak[] = [];
  
  process.env.NODE_ENV === "development" && console.log('🔬 ═══ DETECTOR ENGINE START ═══');
  process.env.NODE_ENV === "development" && console.log('📊 Input:', JSON.stringify({
    industrySlug: input.industrySlug,
    province: input.province,
    annualRevenue: input.annualRevenue,
    paymentMix: input.paymentMix,
    paymentTools: input.paymentTools,
    mainCosts: input.mainCosts,
    employeeCount: input.employeeCount,
    usesAccountingSoftware: input.usesAccountingSoftware,
    tier: input.tier,
  }));
  process.env.NODE_ENV === "development" && console.log('📈 Benchmarks:', benchmarks.length, 'loaded:', benchmarks.map(b => b.metric_key).join(', '));
  
  const detectors: [string, (i: PrescanInput, b: Benchmark[]) => DetectedLeak | null][] = [
    ['processing', detectProcessingLeak],
    ['rent', detectRentLeak],
    ['tax', detectTaxLeak],
    ['payroll', detectPayrollLeak],
    ['insurance', detectInsuranceLeak],
    ['fuel', detectFuelLeak],
    ['software', detectSoftwareLeak],
    ['inventory', detectInventoryLeak],
    ['banking', detectBankingLeak],
    ['marketing', detectMarketingLeak],
    ['cash_shrinkage', detectCashShrinkage],
    ['utilities', detectUtilitiesLeak],
    ['revenue_pricing', detectRevenuePricingLeak],
    ['receivables', detectReceivablesLeak],
    ['late_payments', detectLatePaymentLeak],
    ['equipment', detectEquipmentLeak],
    ['turnover', detectTurnoverLeak],
    ['supplier_discount', detectSupplierDiscountLeak],
    ['debt_interest', detectDebtInterestLeak],
    ['tax_filing', detectTaxFilingLeak],
    ['professional_fees', detectProfessionalFeesLeak],
    ['bookkeeping', detectBookkeepingGapLeak],
    ['subcontractor', detectSubcontractorLeak],
    ['scheduling', detectSchedulingLeak],
    // ['emergency_fund', detectEmergencyFundLeak], // Removed — pure speculation, no data gate
  ];
  
  for (const [name, detector] of detectors) {
    try {
      const leak = detector(input, benchmarks);
      if (leak) {
        leaks.push(leak);
        process.env.NODE_ENV === "development" && console.log(`  ✅ ${name}: $${leak.estimated_annual_leak} (${leak.leak_type_code})`);
      } else {
        process.env.NODE_ENV === "development" && console.log(`  ⬚ ${name}: no leak detected`);
      }
    } catch (e: any) {
      console.error(`  ❌ ${name}: ERROR —`, e.message);
    }
  }
  
  process.env.NODE_ENV === "development" && console.log(`🔬 ═══ DETECTOR ENGINE END — ${leaks.length} leaks found ═══`);
  
  // Sort by priority descending
  leaks.sort((a, b) => b.priority_score - a.priority_score);

  // Deduplicate root causes — cap 'no accounting software' leaks at 2
  // (tax_optimization_gap, late_payment_penalties, tax_filing_inefficiency, 
  //  equipment_depreciation_gap, no_bookkeeping_system all stem from same root)
  const acctGapCodes = new Set([
    'tax_optimization_gap', 'late_payment_penalties', 'tax_filing_inefficiency',
    'equipment_depreciation_gap', 'no_bookkeeping_system'
  ]);
  let acctGapCount = 0;
  const deduped = leaks.filter(l => {
    if (acctGapCodes.has(l.leak_type_code)) {
      acctGapCount++;
      return acctGapCount <= 2; // Show top 2, filter rest
    }
    return true;
  });

  // Cap prescan at 7 leaks — more looks fake, fewer looks credible
  return deduped.slice(0, 7);
}

// ============================================================================
// FINANCIAL HEALTH SCORE — Now powered by bhs-engine.ts
// calculateFinancialHealthScore and calculateDataHealthScore imported above
// calculateBHS provides the full multi-dimensional score with explainability

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Insert prescan run and detected leaks into database
 */
export async function insertPrescanRun(
  supabase: ReturnType<typeof createClient>,
  businessId: string,
  userId: string,
  input: PrescanInput,
  leaks: DetectedLeak[],
  scores?: { fhScore: number; dhScore: number }
): Promise<{ prescanRunId: string; leaks: DetectedLeak[] }> {
  // Use pre-computed scores if available, otherwise calculate
  const fhScore = scores?.fhScore ?? calculateFinancialHealthScore(leaks, input.annualRevenue ?? undefined);
  const dhScore = scores?.dhScore ?? calculateDataHealthScore(input);
  const totalLeak = leaks.reduce((sum, l) => sum + l.estimated_annual_leak, 0);
  
  // Generate a fallback ID in case DB insert fails
  const fallbackId = crypto.randomUUID ? crypto.randomUUID() : `prescan-${Date.now()}`;
  let prescanRunId = fallbackId;
  
  // Insert prescan run (fault-tolerant — don't block analysis if DB fails)
  try {
    const { data: prescanRun, error: prescanError } = await (supabase as any)
      .from('prescan_runs')
      .insert({
        // user_id and business_id are temp UUIDs that DON'T exist in
        // users/businesses tables → FK violation. Set NULL for anonymous prescan.
        // Register bridge sets these later when user creates account.
        temp_user_id: userId,
        // user_id: NULL (FK to users)
        // business_id: NULL (FK to businesses)
        industry_slug: input.industrySlug,
        province: input.province,
        annual_revenue: input.annualRevenue,
        employee_count: input.employeeCount,
        health_score: fhScore,
        tier: input.tier,
        scan_status: 'complete',
        prescan_version: 'v3',
        // 058 schema columns
        total_leaks_found: leaks.length,
        estimated_loss_min: totalLeak,
        // 092 schema columns (added by migration 092)
        revenue_band: input.revenueBand,
        payment_mix: input.paymentMix,
        payment_tools: input.paymentTools,
        main_costs: input.mainCosts,
        uses_accounting_software: input.usesAccountingSoftware,
        data_health_score: dhScore,
        total_leak_estimate_year: totalLeak,
        leak_count: leaks.length,
      })
      .select()
      .single();
    
    if (prescanError) {
      console.error('⚠️ prescan_runs insert failed (non-blocking):', prescanError.message);
    } else if (prescanRun) {
      prescanRunId = prescanRun.id;
    }
  } catch (e: any) {
    console.error('⚠️ prescan_runs insert exception (non-blocking):', e.message);
  }
  
  // Map leak codes to categories for 064 schema
  const codeToCategory: Record<string, string> = {
    processing_rate_high: 'payments',
    rent_or_chair_high: 'rent',
    tax_optimization_gap: 'tax',
    payroll_ratio_high: 'payroll',
    insurance_overpayment: 'insurance',
    fuel_vehicle_high: 'fuel',
    software_bloat: 'subscriptions',
    banking_fees_high: 'banking',
    inventory_cogs_high: 'cogs',
    marketing_waste: 'marketing',
    cash_shrinkage: 'payments',
    utilities_overspend: 'utilities',
    revenue_underpricing: 'revenue',
    receivables_leakage: 'revenue',
    late_payment_penalties: 'operations',
    equipment_depreciation_gap: 'tax',
    employee_turnover_cost: 'payroll',
    supplier_discount_missed: 'operations',
    debt_interest_high: 'banking',
    tax_filing_inefficiency: 'tax',
    professional_fees_high: 'operations',
    no_bookkeeping_system: 'operations',
    subcontractor_markup: 'operations',
    scheduling_inefficiency: 'payroll',
    no_emergency_fund: 'operations',
  };
  
  // Leak titles for the dashboard (EN + FR) — keys must match detector leak_type_code values
  const LEAK_TITLES: Record<string, { en: string; fr: string }> = {
    processing_rate_high: { en: 'Processing Rate Too High', fr: 'Taux de traitement trop élevé' },
    rent_or_chair_high: { en: 'Rent Above Benchmark', fr: 'Loyer au-dessus du marché' },
    tax_optimization_gap: { en: 'Missed Tax Deductions', fr: 'Déductions fiscales manquées' },
    payroll_ratio_high: { en: 'Payroll Inefficiency', fr: 'Inefficacité de la paie' },
    insurance_overpayment: { en: 'Insurance Overpayment', fr: 'Surpaiement d\'assurance' },
    fuel_vehicle_high: { en: 'Fuel Costs Above Average', fr: 'Coûts de carburant élevés' },
    software_bloat: { en: 'Software Subscription Bloat', fr: 'Surplus d\'abonnements logiciels' },
    banking_fees_high: { en: 'Banking Fees Too High', fr: 'Frais bancaires trop élevés' },
    inventory_cogs_high: { en: 'Cost of Goods Too High', fr: 'Coût des marchandises trop élevé' },
    marketing_waste: { en: 'Marketing Spend Waste', fr: 'Gaspillage en publicité' },
    cash_shrinkage: { en: 'Cash Handling Losses', fr: 'Pertes de manipulation d\'argent comptant' },
    utilities_overspend: { en: 'Utilities Above Benchmark', fr: 'Services publics au-dessus de la référence' },
    revenue_underpricing: { en: 'Revenue Erosion from Underpricing', fr: 'Érosion des revenus par sous-tarification' },
    receivables_leakage: { en: 'Uncollected Invoices', fr: 'Factures non collectées' },
    late_payment_penalties: { en: 'Late Payment Penalties', fr: 'Pénalités de retard de paiement' },
    equipment_depreciation_gap: { en: 'Unclaimed Equipment Depreciation', fr: 'Amortissement d\'équipement non réclamé' },
    employee_turnover_cost: { en: 'Employee Turnover Cost', fr: 'Coûts de roulement du personnel' },
    supplier_discount_missed: { en: 'Missed Supplier Discounts', fr: 'Rabais fournisseurs manqués' },
    debt_interest_high: { en: 'Business Debt Interest Gap', fr: 'Écart d\'intérêt sur la dette d\'entreprise' },
    tax_filing_inefficiency: { en: 'GST/HST Input Credits Missed', fr: 'Crédits de taxe sur intrants manqués' },
    professional_fees_high: { en: 'Professional Fees Above Optimal', fr: 'Honoraires professionnels au-dessus de l\'optimal' },
    no_bookkeeping_system: { en: 'No Bookkeeping System', fr: 'Absence de système de comptabilité' },
    subcontractor_markup: { en: 'Subcontractor Cost Gap', fr: 'Écart de coûts de sous-traitance' },
    scheduling_inefficiency: { en: 'Scheduling & Overtime Waste', fr: 'Gaspillage en horaires et temps supplémentaire' },
    no_emergency_fund: { en: 'Reactive Cost Premium', fr: 'Prime de coûts réactifs' },
  };
  
  const LEAK_DESCRIPTIONS: Record<string, { en: string; fr: string }> = {
    processing_rate_high: { en: 'Your card processing rate is above the industry median. Renegotiating or switching processors could save you significantly.', fr: 'Votre taux de traitement est au-dessus de la médiane. Renégocier ou changer de fournisseur pourrait vous faire économiser.' },
    rent_or_chair_high: { en: 'Your rent-to-revenue ratio is higher than similar businesses. Consider renegotiating your lease at renewal.', fr: 'Votre ratio loyer/revenus est plus élevé que des entreprises similaires. Renégociez votre bail au renouvellement.' },
    tax_optimization_gap: { en: 'Without proper accounting software, businesses typically miss 5-10% in eligible deductions.', fr: 'Sans logiciel de comptabilité, les entreprises manquent typiquement 5-10% des déductions admissibles.' },
    payroll_ratio_high: { en: 'Your payroll costs are above benchmark. Review overtime, classifications, and CNESST optimization.', fr: 'Vos coûts de paie sont au-dessus du benchmark. Révisez le temps supplémentaire et l\'optimisation CNESST.' },
    insurance_overpayment: { en: 'Businesses that haven\'t compared insurance in 2+ years typically overpay by 15-25%.', fr: 'Les entreprises qui n\'ont pas comparé leurs assurances depuis 2+ ans surpaient de 15-25%.' },
    fuel_vehicle_high: { en: 'Your fuel costs are above average. Route optimization and fuel card programs could help.', fr: 'Vos coûts de carburant sont au-dessus de la moyenne. L\'optimisation des trajets pourrait aider.' },
    software_bloat: { en: 'Businesses at your level often accumulate overlapping subscriptions. An audit could eliminate waste.', fr: 'Les entreprises accumulent souvent des abonnements redondants. Un audit pourrait éliminer le gaspillage.' },
    banking_fees_high: { en: 'Comparing commercial account packages from multiple banks could reduce your fees.', fr: 'Comparer les forfaits bancaires de plusieurs banques pourrait réduire vos frais.' },
    inventory_cogs_high: { en: 'Your cost of goods is above benchmark. Review supplier pricing and waste reduction.', fr: 'Votre coût des marchandises est au-dessus du benchmark. Révisez les prix fournisseurs.' },
    marketing_waste: { en: 'Your marketing spend may not be optimized. Tracking ROI by channel could redirect budget effectively.', fr: 'Vos dépenses marketing ne sont peut-être pas optimisées. Le suivi du ROI par canal pourrait aider.' },
    cash_shrinkage: { en: 'Cash-heavy businesses lose 2-4% to counting errors, miscounts, and shrinkage. POS systems reduce this dramatically.', fr: 'Les entreprises en comptant perdent 2-4% en erreurs de comptage et pertes. Les systèmes POS réduisent ceci considérablement.' },
    utilities_overspend: { en: 'Your utility costs are above benchmark for your industry and size. Energy audits and rate comparisons can help.', fr: 'Vos coûts de services publics sont au-dessus de la référence. Des audits énergétiques et comparaisons de tarifs peuvent aider.' },
    revenue_underpricing: { en: 'Most small businesses don\'t raise prices annually to match inflation, losing 2-3% of revenue purchasing power each year.', fr: 'La plupart des PME n\'augmentent pas leurs prix annuellement pour suivre l\'inflation, perdant 2-3% de pouvoir d\'achat chaque année.' },
    receivables_leakage: { en: 'Service businesses typically write off 3-5% of invoiced revenue due to late or uncollected payments.', fr: 'Les entreprises de services radient typiquement 3-5% des revenus facturés en raison de paiements en retard ou non collectés.' },
    late_payment_penalties: { en: 'Without payment tracking, businesses average $500-2000/yr in avoidable late fees on suppliers, taxes, and utilities.', fr: 'Sans suivi des paiements, les entreprises paient en moyenne 500-2000$/an en frais de retard évitables.' },
    equipment_depreciation_gap: { en: 'Businesses without accounting software often miss CCA (Capital Cost Allowance) deductions on equipment purchases.', fr: 'Les entreprises sans logiciel de comptabilité manquent souvent les déductions DPA sur les achats d\'équipement.' },
    employee_turnover_cost: { en: 'Each employee replacement costs 30-50% of their annual salary. Reducing turnover by even 5% saves significantly.', fr: 'Chaque remplacement d\'employé coûte 30-50% de leur salaire annuel. Réduire le roulement de 5% économise considérablement.' },
    supplier_discount_missed: { en: 'Most suppliers offer 2-5% early payment discounts that go unclaimed. Negotiating terms could save thousands.', fr: 'La plupart des fournisseurs offrent des rabais de 2-5% pour paiement rapide qui ne sont pas réclamés.' },
    debt_interest_high: { en: 'SMB interest rates vary by 2-3% between lenders. Refinancing or consolidating could reduce your interest burden.', fr: 'Les taux d\'intérêt PME varient de 2-3% entre prêteurs. Refinancer ou consolider pourrait réduire votre fardeau.' },
    tax_filing_inefficiency: { en: 'Without proper tracking, 1-2% of eligible GST/HST input tax credits go unclaimed each year.', fr: 'Sans suivi adéquat, 1-2% des crédits de taxe sur intrants admissibles ne sont pas réclamés chaque année.' },
    professional_fees_high: { en: 'Most businesses don\'t compare accountant or lawyer fees. Shopping around typically saves 15-30%.', fr: 'La plupart des entreprises ne comparent pas les honoraires de comptable ou avocat. Magasiner économise typiquement 15-30%.' },
    no_bookkeeping_system: { en: 'Without a bookkeeping system, businesses lose money to lost receipts, missed expenses, and duplicate payments.', fr: 'Sans système de comptabilité, les entreprises perdent de l\'argent en reçus perdus, dépenses manquées et paiements en double.' },
    subcontractor_markup: { en: 'Subcontractor costs vary widely. Competitive bidding and regular rate reviews can reduce this gap.', fr: 'Les coûts de sous-traitance varient considérablement. Les appels d\'offres et révisions régulières peuvent réduire cet écart.' },
    scheduling_inefficiency: { en: 'Poor scheduling leads to overtime premiums and understaffing costs. Scheduling software pays for itself quickly.', fr: 'Un mauvais horaire mène à des primes de temps supplémentaire. Un logiciel d\'horaires se rentabilise rapidement.' },
    no_emergency_fund: { en: 'Without cash reserves, businesses pay premium rates for emergency repairs, rush orders, and short-term credit.', fr: 'Sans réserves, les entreprises paient des tarifs premium pour les réparations urgentes et le crédit à court terme.' },
  };

  const severityLabel = (score: number): string => {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 30) return 'MEDIUM';
    return 'LOW';
  };
  
  // Insert detected leaks — matches 058 schema (category, title NOT NULL)
  if (leaks.length > 0) {
    try {
      const leaksToInsert = leaks.map((leak, idx) => ({
        // 058 schema columns (known to exist)
        prescan_run_id: prescanRunId,
        leak_type_code: leak.leak_type_code,
        category: codeToCategory[leak.leak_type_code] || 'other',
        title: LEAK_TITLES[leak.leak_type_code]?.en || leak.leak_type_code.replace(/_/g, ' '),
        title_fr: LEAK_TITLES[leak.leak_type_code]?.fr || null,
        description: LEAK_DESCRIPTIONS[leak.leak_type_code]?.en || null,
        description_fr: LEAK_DESCRIPTIONS[leak.leak_type_code]?.fr || null,
        severity: severityLabel(leak.severity_score),
        annual_impact_min: leak.estimated_annual_leak,
        impact_pct: leak.estimated_annual_leak && input.annualRevenue 
          ? Math.round((leak.estimated_annual_leak / input.annualRevenue) * 10000) / 100 
          : null,
        evidence: { ...(leak.metadata || {}), confidence_score: leak.confidence_score, severity_score: leak.severity_score, priority_score: leak.priority_score },
        priority_score: leak.priority_score || 50,
        display_order: idx,
        is_free_preview: true,
      }));
      
      const { error: leaksError } = await (supabase as any)
        .from('detected_leaks')
        .insert(leaksToInsert);
      
      if (leaksError) {
        console.error('⚠️ detected_leaks insert failed (non-blocking):', leaksError.message);
      }
    } catch (e: any) {
      console.error('⚠️ detected_leaks insert exception (non-blocking):', e.message);
    }
  }
  
  return {
    prescanRunId,
    leaks,
  };
}

// ============================================================================
// AFFILIATE PARTNER MATCHING
// ============================================================================
// Maps each detected leak to relevant affiliate partners from the database.
// Leak category → affiliate_partners.category lookup with province filtering.
// ============================================================================

const LEAK_TO_AFFILIATE_CATEGORIES: Record<string, string[]> = {
  processing_rate_high:     ['payment_processing'],
  rent_or_chair_high:       [],  // no direct affiliate
  tax_optimization_gap:     ['accounting', 'tax'],
  payroll_ratio_high:       ['payroll', 'hr'],
  insurance_overpayment:    ['insurance'],
  fuel_vehicle_high:        ['energy'],
  software_bloat:           ['accounting'],  // accounting software replaces bloat
  banking_fees_high:        ['banking'],
  inventory_cogs_high:      [],  // supplier-specific
  marketing_waste:          ['marketing', 'digital'],
  cash_shrinkage:           ['payment_processing'],  // POS systems
  utilities_overspend:      ['energy'],
  revenue_underpricing:     ['accounting'],
  receivables_leakage:      ['accounting', 'billing'],
  late_payment_penalties:   ['accounting'],
  equipment_depreciation_gap: ['tax', 'accounting'],
  employee_turnover_cost:   ['hr', 'payroll'],
  supplier_discount_missed: [],
  debt_interest_high:       ['banking', 'financing'],
  tax_filing_inefficiency:  ['tax', 'accounting'],
  professional_fees_high:   [],
  no_bookkeeping_system:    ['accounting'],
  subcontractor_markup:     [],
  scheduling_inefficiency:  ['hr', 'booking'],
  no_emergency_fund:        ['banking', 'financing'],
};

async function matchAffiliatePartners(
  supabase: ReturnType<typeof createClient>,
  leaks: DetectedLeak[],
  province: string,
): Promise<void> {
  // Collect all unique affiliate categories needed
  const allCategories = new Set<string>();
  for (const leak of leaks) {
    const cats = LEAK_TO_AFFILIATE_CATEGORIES[leak.leak_type_code] || [];
    cats.forEach(c => allCategories.add(c));
  }

  if (allCategories.size === 0) return;

  // Single DB query: get all matching partners
  const { data: partners, error } = await (supabase as any)
    .from('affiliate_partners')
    .select('name, slug, description, website_url, referral_url, category, sub_category, pricing_type, priority_score, provinces, languages')
    .in('category', Array.from(allCategories))
    .eq('active', true)
    .order('priority_score', { ascending: false });

  if (error || !partners || partners.length === 0) return;

  // Filter by province (NULL provinces = all provinces)
  const filtered = partners.filter((p: any) =>
    !p.provinces || p.provinces.length === 0 || p.provinces.includes(province)
  );

  // Group by category for fast lookup
  const byCategory: Record<string, any[]> = {};
  for (const p of filtered) {
    if (!byCategory[p.category]) byCategory[p.category] = [];
    byCategory[p.category].push(p);
  }

  // Attach top 3 matching partners to each leak
  for (const leak of leaks) {
    const cats = LEAK_TO_AFFILIATE_CATEGORIES[leak.leak_type_code] || [];
    const matches: AffiliateMatch[] = [];
    const seen = new Set<string>();

    for (const cat of cats) {
      for (const p of (byCategory[cat] || [])) {
        if (seen.has(p.slug)) continue;
        seen.add(p.slug);
        matches.push({
          name: p.name,
          slug: p.slug,
          description: p.description,
          website_url: p.website_url,
          referral_url: p.referral_url || p.website_url,
          category: p.category,
          pricing_type: p.pricing_type,
          priority_score: p.priority_score || 50,
        });
        if (matches.length >= 3) break;
      }
      if (matches.length >= 3) break;
    }

    leak.affiliates = matches;
  }
}

// ============================================================================
// MAIN ORCHESTRATOR
// ============================================================================

/**
 * Run complete prescan for a business
 */
export async function runPrescanForBusiness(
  supabase: ReturnType<typeof createClient>,
  businessId: string,
  userId: string,
  tags: PrescanTags
): Promise<{ 
  prescanRunId: string; 
  leaks: DetectedLeak[]; 
  fhScore: number; 
  dhScore: number;
  bhs: BHSResult;
  tier: 'solo' | 'small' | 'growth';
  pricing: number;
}> {
  // Step 1: Build input from tags (now includes tier)
  const input = buildPrescanInputFromTags(tags);
  
  // Step 2: Load benchmarks
  const benchmarks = await loadBenchmarks(supabase, input.industrySlug, input.province);
  
  // Step 3: Detect leaks
  const leaks = detectLeaks(input, benchmarks);
  
  // Step 4: Re-score each leak with proper math (scoreLeakV2)
  const dataPoints = [
    input.annualRevenue,
    input.industrySlug,
    input.province !== 'QC' ? input.province : null, // QC is default — only count if explicitly stated
    input.paymentMix !== 'unknown' ? input.paymentMix : null, // 'unknown' means no data
    input.paymentTools.length > 0 ? input.paymentTools.length : null,
    input.mainCosts.length > 0 ? input.mainCosts.length : null,
    input.employeeCount > 0 ? input.employeeCount : null,
  ].filter(Boolean).length;
  
  for (const leak of leaks) {
    const scores = scoreLeakV2(
      { amount: leak.estimated_annual_leak, code: leak.leak_type_code, confidence_score: leak.confidence_score },
      input,
      benchmarks,
      dataPoints
    );
    leak.severity_score = scores.severity;
    leak.confidence_score = scores.confidence;
    leak.priority_score = scores.priority;
    leak.detection_confidence = scores.confidence / 100;
  }
  
  // Re-sort by new priority scores
  leaks.sort((a, b) => b.priority_score - a.priority_score);
  
  // Step 5: Calculate Business Health Score (the anchor metric)
  const bhs = calculateBHS(leaks, input, benchmarks);
  const fhScore = bhs.score;
  const dhScore = calculateDataHealthScore(input);
  
  // Step 5.5: Match affiliate partners to each leak
  try {
    await matchAffiliatePartners(supabase, leaks, input.province);
  } catch (e: any) {
    console.warn('⚠️ Affiliate matching (non-blocking):', e.message);
  }
  
  // Step 6: Insert into database (pass pre-computed scores)
  const { prescanRunId } = await insertPrescanRun(supabase, businessId, userId, input, leaks, { fhScore, dhScore });
  
  // Step 7: Get pricing for tier
  const pricing = getTierPricing(input.tier);
  
  return {
    prescanRunId,
    leaks,
    fhScore,
    dhScore,
    bhs,
    tier: input.tier,
    pricing,
  };
}
