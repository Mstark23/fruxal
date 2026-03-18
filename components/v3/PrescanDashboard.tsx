/**
 * PRESCAN RESULTS DASHBOARD
 * 
 * Displays:
 * - Financial Health Score (0-100)
 * - Total estimated leak per year
 * - Individual leak cards
 * - Monitoring status & upgrade CTA
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface Leak {
  id: string;
  leak_type_code: string;
  estimated_annual_leak: number;
  severity_score: number;
  confidence_score: number;
  priority_score: number;
  metadata: Record<string, any>;
}

interface PrescanDashboardProps {
  businessId: string;
  prescanRunId: string;
  fhScore: number;
  dhScore: number;
  totalLeak: number;
  leaks: Leak[];
  monitoringEnabled: boolean;
  locale?: 'en' | 'fr';
}

const LEAK_INFO = {
  en: {
    processing_rate_high: {
      title: 'Card Processing Fees Too High',
      description: 'Your card processing rate is higher than similar businesses in your province.',
      fix: 'Negotiate with your current processor or switch to a better rate.',
    },
    rent_or_chair_high: {
      title: 'Rent/Chair Cost Too High',
      description: 'Your rent or chair rental is taking a larger percentage of revenue than typical.',
      fix: 'Negotiate your rent or consider relocating to reduce costs.',
    },
    tax_optimization_gap: {
      title: 'Missing Tax Deductions',
      description: 'Without accounting software, you may be missing significant tax deductions.',
      fix: 'Start using accounting software like QuickBooks to track deductions.',
    },
    cash_management_risk: {
      title: 'Cash Handling Risk',
      description: 'Heavy cash usage with manual tracking creates risk and missed insights.',
      fix: 'Consider accepting more card payments for better tracking.',
    },
  },
  fr: {
    processing_rate_high: {
      title: 'Frais de traitement de cartes trop élevés',
      description: 'Votre taux de traitement est plus élevé que les entreprises similaires.',
      fix: 'Négociez avec votre processeur actuel ou changez pour un meilleur taux.',
    },
    rent_or_chair_high: {
      title: 'Coût de loyer/chaise trop élevé',
      description: 'Votre loyer prend un pourcentage plus élevé du revenu que la normale.',
      fix: 'Négociez votre loyer ou considérez déménager pour réduire les coûts.',
    },
    tax_optimization_gap: {
      title: 'Déductions fiscales manquées',
      description: 'Sans logiciel comptable, vous pourriez manquer des déductions importantes.',
      fix: 'Utilisez un logiciel comptable comme QuickBooks pour suivre vos déductions.',
    },
    cash_management_risk: {
      title: 'Risque de gestion de l\'argent comptant',
      description: 'L\'usage important de comptant avec suivi manuel crée des risques.',
      fix: 'Considérez accepter plus de paiements par carte pour meilleur suivi.',
    },
  },
};

export default function PrescanDashboard({
  businessId,
  prescanRunId,
  fhScore,
  dhScore,
  totalLeak,
  leaks,
  monitoringEnabled,
  locale = 'en',
}: PrescanDashboardProps) {
  const router = useRouter();
  const t = LEAK_INFO[locale];
  
  const isEn = locale === 'en';
  
  // Calculate leak range (conservative estimate)
  const leakLow = Math.round(totalLeak * 0.8);
  const leakHigh = Math.round(totalLeak * 1.2);
  
  // Score color
  const scoreColor = fhScore >= 75 ? 'text-green-600' :
                     fhScore >= 50 ? 'text-yellow-600' :
                     'text-red-600';
  
  const scoreBg = fhScore >= 75 ? 'bg-green-50' :
                  fhScore >= 50 ? 'bg-yellow-50' :
                  'bg-red-50';
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEn ? 'Your Financial Leak Snapshot' : 'Vue d\'ensemble de vos fuites financières'}
        </h1>
        <p className="text-gray-600">
          {isEn 
            ? 'Here\'s what we found based on your business structure' 
            : 'Voici ce que nous avons trouvé selon votre structure d\'affaires'}
        </p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Financial Health Score */}
        <div className={`p-6 rounded-lg border-2 ${scoreBg} border-gray-200`}>
          <div className="text-sm font-medium text-gray-600 mb-2">
            {isEn ? 'Financial Health Score' : 'Score de santé financière'}
          </div>
          <div className={`text-5xl font-bold ${scoreColor}`}>
            {fhScore}
            <span className="text-2xl">/100</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {fhScore >= 75 ? (isEn ? 'Good financial health' : 'Bonne santé financière') :
             fhScore >= 50 ? (isEn ? 'Room for improvement' : 'Place à l\'amélioration') :
             (isEn ? 'Needs attention' : 'Nécessite attention')}
          </div>
        </div>
        
        {/* Estimated Leak */}
        <div className="p-6 rounded-lg border-2 bg-red-50 border-red-200">
          <div className="text-sm font-medium text-gray-600 mb-2">
            {isEn ? 'Estimated money leaking per year' : 'Argent perdu estimé par année'}
          </div>
          <div className="text-3xl font-bold text-red-600">
            ${leakLow.toLocaleString()} - ${leakHigh.toLocaleString()}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            {isEn ? 'Based on industry benchmarks' : 'Selon les normes de l\'industrie'}
          </div>
        </div>
        
      </div>
      
      {/* Monitoring Status Banner */}
      {!monitoringEnabled && (
        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {isEn ? 'Monitoring Paused' : 'Surveillance en pause'}
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                {isEn 
                  ? 'Right now, your business is not being monitored. If your costs drift up again, you won\'t know until it\'s too late.'
                  : 'Actuellement, votre entreprise n\'est pas surveillée. Si vos coûts augmentent, vous ne le saurez pas avant qu\'il soit trop tard.'}
              </p>
              <button
                onClick={() => router.push('/upgrade')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                {isEn ? 'Keep an eye on my money' : 'Surveiller mon argent'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Leak Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEn ? 'Detected Leaks' : 'Fuites détectées'} ({leaks.length})
        </h2>
        
        {leaks.length === 0 ? (
          <div className="p-8 text-center bg-green-50 rounded-lg border border-green-200">
            <p className="text-green-800 font-medium">
              {isEn ? 'No major leaks detected!' : 'Aucune fuite majeure détectée!'}
            </p>
            <p className="text-sm text-green-700 mt-1">
              {isEn 
                ? 'Your business looks healthy based on this initial scan.' 
                : 'Votre entreprise semble en bonne santé selon cette analyse initiale.'}
            </p>
          </div>
        ) : (
          leaks.map((leak, index) => {
            const info = t[leak.leak_type_code as keyof typeof t];
            const severityLabel = leak.severity_score >= 70 ? (isEn ? 'High' : 'Élevé') :
                                 leak.severity_score >= 40 ? (isEn ? 'Medium' : 'Moyen') :
                                 (isEn ? 'Low' : 'Bas');
            
            const severityColor = leak.severity_score >= 70 ? 'bg-red-100 text-red-800' :
                                 leak.severity_score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-blue-100 text-blue-800';
            
            return (
              <div key={leak.id || index} className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {info.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${severityColor}`}>
                    {severityLabel}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {info.description}
                </p>
                
                {leak.estimated_annual_leak > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      {isEn ? 'Estimated annual leak' : 'Fuite annuelle estimée'}
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      ${leak.estimated_annual_leak.toLocaleString()}
                      <span className="text-sm text-gray-600 ml-1">
                        {isEn ? '/ year' : '/ an'}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-1">
                    {isEn ? 'How to fix this:' : 'Comment régler ceci:'}
                  </div>
                  <p className="text-sm text-blue-800">
                    {info.fix}
                  </p>
                </div>
                
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span>
                    {isEn ? 'Confidence:' : 'Confiance:'} {leak.confidence_score}%
                  </span>
                  <span>•</span>
                  <span>
                    {isEn ? 'Priority:' : 'Priorité:'} {leak.priority_score}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Next Steps */}
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">
          {isEn ? 'Next Steps' : 'Prochaines étapes'}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600">1.</span>
            <span>
              {isEn 
                ? 'Review each leak and understand the potential savings' 
                : 'Examinez chaque fuite et comprenez les économies potentielles'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">2.</span>
            <span>
              {isEn 
                ? 'Start with the highest-priority leaks first' 
                : 'Commencez par les fuites de plus haute priorité'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600">3.</span>
            <span>
              {isEn 
                ? 'Enable monitoring to track your progress over time' 
                : 'Activez la surveillance pour suivre votre progrès dans le temps'}
            </span>
          </li>
        </ul>
      </div>
      
    </div>
  );
}
