"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function Redirect() {
  const r = useRouter();
  useEffect(() => { r.replace("/v2/leaks"); }, [r]);
  return null;
}
