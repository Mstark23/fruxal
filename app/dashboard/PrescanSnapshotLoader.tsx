"use client";

import { useEffect, useState } from "react";
import PrescanSnapshot from "@/components/PrescanSnapshot";

export default function PrescanSnapshotLoader({ prescanRunId }: { prescanRunId: string }) {
  const [lang, setLang] = useState<"en" | "fr">("en");

  useEffect(() => {
    if (navigator.language?.toLowerCase().startsWith("fr")) setLang("fr");
  }, []);

  return <PrescanSnapshot prescanRunId={prescanRunId} lang={lang} />;
}
