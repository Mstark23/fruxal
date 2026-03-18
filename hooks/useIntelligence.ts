// =============================================================================
// src/hooks/useIntelligence.ts — React hooks for intelligence system
// =============================================================================
// Use in any client component to fetch/interact with the intelligence API.
// =============================================================================

"use client";

import { useState, useCallback } from "react";
import type {
  IntelligenceReport,
  PrescanInput,
  GovernmentProgram,
  SmartPartner,
} from "@/types/intelligence";

// ─── Prescan Hook ────────────────────────────────────────────────────────────
// Call from prescan form submission

export function usePrescan() {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrescan = useCallback(async (input: PrescanInput) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/v2/prescan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || "Prescan failed");
      }

      setReport(json.data);
      return json.data as IntelligenceReport;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, runPrescan };
}

// ─── Intelligence Report Hook ────────────────────────────────────────────────
// For the dashboard — fetches latest report for a business

export function useIntelligenceReport(businessId: string | null) {
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(
    async (refresh = false) => {
      if (!businessId) return null;
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ businessId });
        if (refresh) params.set("refresh", "1");

        const res = await fetch(`/api/v2/intelligence?${params}`);
        const json = await res.json();

        if (!json.success) {
          if (json.code === "NO_REPORT") {
            setReport(null);
            return null;
          }
          throw new Error(json.error);
        }

        setReport(json.data);
        return json.data as IntelligenceReport;
      } catch (err: any) {
        setError(err.message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [businessId]
  );

  return { report, loading, error, fetchReport };
}

// ─── Government Programs Hook ────────────────────────────────────────────────

export function useGovernmentPrograms() {
  const [programs, setPrograms] = useState<GovernmentProgram[]>([]);
  const [totalFunding, setTotalFunding] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPrograms = useCallback(
    async (params: {
      industry?: string;
      structure?: string;
      employees?: number;
      revenue?: number;
      incorporated?: boolean;
    }) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams();
        if (params.industry) qs.set("industry", params.industry);
        if (params.structure) qs.set("structure", params.structure);
        if (params.employees) qs.set("employees", String(params.employees));
        if (params.revenue) qs.set("revenue", String(params.revenue));
        if (params.incorporated) qs.set("incorporated", "true");

        const res = await fetch(`/api/v2/programs?${qs}`);
        const json = await res.json();

        if (json.success) {
          setPrograms(json.data.programs);
          setTotalFunding(json.data.total_funding_available);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { programs, totalFunding, loading, fetchPrograms };
}

// ─── Smart Partners Hook ─────────────────────────────────────────────────────

export function useSmartPartners() {
  const [partners, setPartners] = useState<SmartPartner[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPartners = useCallback(
    async (params: {
      category: string;
      province?: string;
      industry?: string;
      language?: string;
    }) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ category: params.category });
        if (params.province) qs.set("province", params.province);
        if (params.industry) qs.set("industry", params.industry);
        if (params.language) qs.set("language", params.language);

        const res = await fetch(`/api/v2/partners?${qs}`);
        const json = await res.json();

        if (json.success) {
          setPartners(json.data.partners);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Track partner click
  const trackClick = useCallback(
    async (partnerSlug: string, businessId?: string, leakId?: string) => {
      try {
        const res = await fetch("/api/v2/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ partnerSlug, businessId, leakId, source: "dashboard" }),
        });
        const json = await res.json();
        if (json.success && json.data.redirect_url) {
          window.open(json.data.redirect_url, "_blank");
        }
      } catch (err) {
        console.error("Partner click tracking failed:", err);
      }
    },
    []
  );

  return { partners, loading, fetchPartners, trackClick };
}
