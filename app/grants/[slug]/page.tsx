// =============================================================================
// /grants/[slug] — SEO landing pages for Canadian government grants
// =============================================================================
// Static pages for SR&ED, CDAP, Canada Job Grant, etc.
// Each page explains the grant, who qualifies, and CTA to free scan.
// =============================================================================
import type { Metadata } from "next";

const GRANTS: Record<string, {
  name: string; nameFr: string;
  tagline: string; taglineFr: string;
  amount: string; category: string;
  body: string; bodyFr: string;
  cta: string; ctaFr: string;
}> = {
  "sred-tax-credit": {
    name: "SR&ED Tax Credit",
    nameFr: "Crédit d'impôt RS&DE",
    tagline: "The most valuable tax credit available to Canadian small businesses — and most never claim it.",
    taglineFr: "Le crédit d'impôt le plus précieux pour les PME canadiennes — et la plupart ne le réclament jamais.",
    amount: "Up to $1,050,000 refundable",
    category: "Tax Credit",
    body: `The Scientific Research and Experimental Development (SR&ED) program provides a 35% refundable federal tax credit on eligible R&D expenditures for Canadian-Controlled Private Corporations (CCPCs). Quebec businesses receive an additional 30% provincial credit, creating a combined rate of up to 65% on qualifying salaries.

What qualifies: custom software development, product iteration, process improvement experiments, prototype testing — far broader than most business owners assume. If your team is solving a technical problem without a known solution, you likely qualify.

Average recovery: $18,000–$180,000 per year for eligible businesses. The claim covers wages, materials, and contractor costs related to qualifying work.

Most businesses that qualify have never filed. The claim requires a technical narrative and financial documentation — work that Fruxal's recovery team handles on contingency.`,
    bodyFr: `Le programme RS&DE offre un crédit d'impôt fédéral remboursable de 35% sur les dépenses admissibles de R&D pour les SPCC. Les entreprises québécoises reçoivent un crédit provincial additionnel de 30%, créant un taux combiné jusqu'à 65% sur les salaires admissibles.

Ce qui est admissible: développement de logiciels personnalisés, itération de produits, expériences d'amélioration de processus, tests de prototypes. Si votre équipe résout un problème technique sans solution connue, vous êtes probablement admissible.

Récupération moyenne: 18 000$–180 000$ par année pour les entreprises admissibles.`,
    cta: "Find out if your business qualifies — free scan",
    ctaFr: "Découvrez si votre entreprise est admissible — scan gratuit",
  },
  "cdap": {
    name: "Canada Digital Adoption Program (CDAP)",
    nameFr: "Programme canadien d'adoption du numérique (PCAN)",
    tagline: "Up to $15,000 grant to go digital — plus a $100K interest-free loan.",
    taglineFr: "Jusqu'à 15 000$ pour numériser votre entreprise — plus un prêt sans intérêt de 100 000$.",
    amount: "$15,000 grant + $100,000 loan",
    category: "Grant",
    body: `The Canada Digital Adoption Program (CDAP) provides Canadian businesses with up to $15,000 to adopt digital technologies, along with access to a $100,000 interest-free BDC loan.

The grant covers: e-commerce setup, digital payment systems, inventory management software, cybersecurity tools, cloud migration, and more.

Eligibility: Canadian businesses with 1-499 employees, at least $500K in annual revenue, and an active CRA business number. Most small businesses qualify but never apply.

The process requires a digital adoption plan developed with a certified CDAP advisor — something Fruxal coordinates on your behalf as part of the engagement.`,
    bodyFr: `Le PCAN offre aux entreprises canadiennes jusqu'à 15 000$ pour adopter des technologies numériques, plus un prêt BDC sans intérêt de 100 000$.

Éligibilité: entreprises canadiennes avec 1-499 employés, au moins 500 000$ de revenus annuels, et un numéro d'entreprise ARC actif.`,
    cta: "Check your eligibility — free scan",
    ctaFr: "Vérifiez votre admissibilité — scan gratuit",
  },
  "canada-job-grant": {
    name: "Canada Job Grant",
    nameFr: "Subvention canadienne pour l'emploi",
    tagline: "The federal government covers 2/3 of your employee training costs. Most employers never claim it.",
    taglineFr: "Le gouvernement fédéral couvre 2/3 des coûts de formation de vos employés.",
    amount: "Up to $10,000 per employee",
    category: "Training Grant",
    body: `The Canada Job Grant provides up to $10,000 per employee for eligible training costs. The federal and provincial governments cover two-thirds of the cost — employers pay only one-third.

Eligibility: any Canadian business paying for employee training through an eligible third-party trainer. Covers courses, certifications, software training, safety training, and professional development.

Annual impact: a business training 5 employees per year could recover $25,000–$50,000 annually from costs already being incurred. Most businesses paying for training have never applied.`,
    bodyFr: `La Subvention canadienne pour l'emploi offre jusqu'à 10 000$ par employé pour les coûts de formation admissibles. Les gouvernements fédéral et provinciaux couvrent les deux tiers du coût.`,
    cta: "See what training grants apply to you — free",
    ctaFr: "Voir quelles subventions s'appliquent — gratuit",
  },
};

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const g = GRANTS[params.slug];
  if (!g) return { title: "Grant not found" };
  return {
    title: `${g.name} — Canadian Business Grant Guide | Fruxal`,
    description: g.tagline,
    openGraph: { title: g.name, description: g.tagline, url: `https://fruxal.ca/grants/${params.slug}` },
  };
}

export async function generateStaticParams() {
  return Object.keys(GRANTS).map(slug => ({ slug }));
}

export default function GrantPage({ params }: Props) {
  const g = GRANTS[params.slug];
  if (!g) return <div className="min-h-screen flex items-center justify-center"><p>Grant not found.</p></div>;

  return (
    <div className="min-h-screen bg-bg font-sans">
      {/* Nav */}
      <nav className="h-[60px] px-6 flex items-center justify-between border-b border-border-light bg-white">
        <a href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-brand flex items-center justify-center">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5"/></svg>
          </div>
          <span className="font-serif text-[17px] font-semibold text-ink">Fruxal</span>
        </a>
        <a href="/" className="px-4 py-2 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
          Free business scan →
        </a>
      </nav>

      <div className="max-w-[720px] mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-2">
          <span className="inline-block text-[10px] font-bold text-brand uppercase tracking-wider bg-brand-soft px-2.5 py-1 rounded-full mb-4">{g.category}</span>
        </div>
        <h1 className="font-serif text-[42px] font-normal text-ink leading-tight mb-4">{g.name}</h1>
        <p className="text-[20px] text-ink-secondary leading-relaxed mb-6">{g.tagline}</p>

        {/* Amount highlight */}
        <div className="bg-brand/5 border border-brand/10 rounded-2xl px-6 py-5 mb-10">
          <p className="text-[11px] font-bold text-brand/70 uppercase tracking-wider mb-1">Maximum benefit</p>
          <p className="font-serif text-[32px] text-brand font-normal">{g.amount}</p>
        </div>

        {/* Body */}
        <div className="prose prose-sm max-w-none text-ink-secondary leading-relaxed mb-12">
          {g.body.split("\n\n").map((para, i) => (
            <p key={i} className="mb-4 text-[15px]">{para}</p>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-white border border-border rounded-2xl p-8 text-center">
          <p className="font-serif text-[22px] text-ink mb-2">{g.cta}</p>
          <p className="text-sm text-ink-secondary mb-6">
            Answer 5 questions about your business. See which grants apply and how much you could recover.
            Takes 3 minutes. Completely free.
          </p>
          <a href={`https://fruxal.ca/?utm_source=seo&utm_medium=grants&utm_campaign=${params.slug}`}
            className="inline-block px-8 py-3.5 text-sm font-semibold text-white bg-brand rounded-sm hover:bg-brand-light transition">
            Scan My Business — Free →
          </a>
          <p className="text-[11px] text-ink-faint mt-3">No cost until we recover · We take 12% of what we find</p>
        </div>

        {/* Related grants */}
        <div className="mt-10">
          <p className="text-[11px] font-bold text-ink-muted uppercase tracking-wider mb-4">Other Canadian grants</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(GRANTS).filter(([s]) => s !== params.slug).map(([s, gr]) => (
              <a key={s} href={`/grants/${s}`}
                className="bg-white border border-border rounded-xl p-4 hover:border-brand/30 transition">
                <p className="text-[10px] font-bold text-ink-muted uppercase mb-1">{gr.category}</p>
                <p className="text-sm font-semibold text-ink">{gr.name}</p>
                <p className="text-[11px] text-brand mt-1">{gr.amount}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
