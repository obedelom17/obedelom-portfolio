import { ImageResponse } from "next/og"

export const alt = "AGBEBAVI Elom Obed | Développeur Full-Stack"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f2eee6",
          color: "#16150f",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 24, letterSpacing: 3, color: "#6a655a", fontFamily: "monospace" }}>
          LOMÉ, TOGO
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, lineHeight: 1, letterSpacing: -3, display: "flex" }}>AGBEBAVI Elom Obed</div>
          <div style={{ fontSize: 44, marginTop: 28, color: "#b8431c", fontStyle: "italic", display: "flex" }}>
            Développeur full-stack
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "#6a655a", fontFamily: "monospace" }}>
          Next.js / React / Django / Supabase
        </div>
      </div>
    ),
    { ...size },
  )
}
