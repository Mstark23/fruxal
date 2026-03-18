import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fruxal — Find Where Your Business Is Leaking Money";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#0a0e17", color: "white", fontFamily: "system-ui" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>💧</div>
        <div style={{ fontSize: 48, fontWeight: 900, marginBottom: 8 }}>Fruxal</div>
        <div style={{ fontSize: 24, color: "#888", maxWidth: 600, textAlign: "center" }}>Find where your business is leaking money. 303 detectors. 11 industries. 30 seconds.</div>
        <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
          <div style={{ background: "#ff3d57", padding: "8px 20px", borderRadius: 8, fontSize: 18, fontWeight: 700 }}>Find Leaks</div>
          <div style={{ background: "#00c853", color: "black", padding: "8px 20px", borderRadius: 8, fontSize: 18, fontWeight: 700 }}>Fix & Save</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
