import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#f5f7fa" },
    { media: "(prefers-color-scheme: light)", color: "#f5f7fa" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://brunogusmao.dev"),
  title: {
    default: "Bruno Gusmão — Desenvolvedor Full Stack",
    template: "%s | Bruno Gusmão",
  },
  description:
    "Desenvolvedor full stack na interseção entre Direito e Tecnologia. React, Next.js, Node.js, NestJS, TypeScript e Docker.",
  keywords: [
    "Bruno Gusmão",
    "desenvolvedor full stack",
    "Next.js",
    "React",
    "NestJS",
    "TypeScript",
    "Node.js",
    "Docker",
  ],
  authors: [{ name: "Bruno Gusmão", url: "https://brunogusmao.dev" }],
  creator: "Bruno Gusmão",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/brand/logo-180.png",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://brunogusmao.dev",
    siteName: "Bruno Gusmão",
    title: "Bruno Gusmão — Desenvolvedor Full Stack",
    description:
      "Desenvolvedor full stack na interseção entre Direito e Tecnologia. React, Next.js, Node.js, NestJS, TypeScript e Docker.",
    images: [
      {
        url: "/og-image.png",
        width: 1536,
        height: 1024,
        alt: "Bruno Gusmão — Desenvolvedor Full Stack",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Bruno Gusmão — Desenvolvedor Full Stack",
    description:
      "Desenvolvedor full stack na interseção entre Direito e Tecnologia.",
    images: ["/og-image.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: "https://brunogusmao.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId =
    process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "ca-pub-4098373811378908";

  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
          crossOrigin="anonymous"
        />
      </head>
      <body className="relative min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
