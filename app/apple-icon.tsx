import { ImageResponse } from "next/og";

export const size     = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180, height: 180,
          borderRadius: 40,
          background: "#1B3A2D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2" strokeLinecap="round">
          <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
