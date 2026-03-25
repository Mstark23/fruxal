import { ImageResponse } from "next/og";

export const size     = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32, height: 32,
          borderRadius: 7,
          background: "#1B3A2D",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="white" strokeWidth="2.4" strokeLinecap="round">
          <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
