import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AGBEBAVI Elom Obed | Ingénieur en informatique",
    short_name: "Obed",
    description: "Portfolio de AGBEBAVI Elom Obed, ingénieur en informatique à Lomé, Togo.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    lang: "fr",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  }
}
