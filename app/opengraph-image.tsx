import { ImageResponse } from "next/og";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OgImage() {
  return new ImageResponse((
    <div style={{width:1200,height:630,background:"#FAFAF8",display:"flex",flexDirection:"column",padding:"80px"}}>
      <div style={{display:"flex",fontSize:60,color:"#1A1A18"}}>Fruxal</div>
      <div style={{display:"flex",fontSize:28,color:"#56554F"}}>Free financial diagnostics for Canadian SMBs</div>
    </div>
  ), { ...size });
}