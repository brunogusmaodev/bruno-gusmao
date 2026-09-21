import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Bruno Gusmão — Desenvolvedor Full Stack",
    short_name: "Bruno Gusmão",
    description: "Portfolio e blog de Bruno Gusmão, desenvolvedor full stack.",
    start_url: "/",
    display: "standalone",
    background_color: "#03040a",
    theme_color: "#03040a",
    icons: [
      { src: "/brand/logo-48.png", sizes: "48x48", type: "image/png" },
      { src: "/brand/logo-128.png", sizes: "128x128", type: "image/png" },
      { src: "/brand/logo-180.png", sizes: "180x180", type: "image/png" },
      { src: "/brand/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
