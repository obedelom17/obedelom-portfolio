import { ImageResponse } from "next/og"

export const alt = "AGBEBAVI Elom Obed | Ingénieur en informatique"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          color: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: "#6b6b66", fontFamily: "monospace" }}>
          LOMÉ, TOGO
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, lineHeight: 1, letterSpacing: -3, display: "flex" }}>AGBEBAVI Elom Obed</div>
          <div style={{ fontSize: 44, marginTop: 28, color: "#1a3c2e", fontStyle: "italic", display: "flex" }}>
            Ingénieur en informatique
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#6b6b66", fontFamily: "monospace" }}>
          Next.js / React / Django / Supabase
        </div>
      </div>
    ),
    { ...size },
  )
}
