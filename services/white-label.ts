// =============================================================================
// WHITE-LABEL CONFIG — Custom branding per business
// =============================================================================
// Stores: logo URL, primary color, company name, custom domain
// Used by dashboard to override default Fruxal branding
// =============================================================================

export interface WhiteLabelConfig {
  enabled: boolean;
  companyName: string;
  logoUrl: string;
  primaryColor: string;
  accentColor: string;
  domain: string;
  hideLeakAndGrow: boolean;
}

const DEFAULT_CONFIG: WhiteLabelConfig = {
  enabled: false,
  companyName: "Fruxal",
  logoUrl: "",
  primaryColor: "#1a1a2e",
  accentColor: "#00c853",
  domain: "",
  hideLeakAndGrow: false,
};

export async function getWhiteLabelConfig(businessId: string): Promise<WhiteLabelConfig> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const { data } = await sb.from("businesses").select("whiteLabelConfig").eq("id", businessId).single();
    if (data?.whiteLabelConfig) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(data.whiteLabelConfig) };
    }
  } catch (e) {}
  return DEFAULT_CONFIG;
}

export async function saveWhiteLabelConfig(businessId: string, config: Partial<WhiteLabelConfig>): Promise<boolean> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    await sb.from("businesses").update({ whiteLabelConfig: JSON.stringify(config) }).eq("id", businessId);
    return true;
  } catch (e) { return false; }
}
