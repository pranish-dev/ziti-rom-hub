import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { NavigationProgress } from "@/components/navigation-progress";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700"],
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-plex-sans",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Custom ROMs for the ${site.device} (${site.codename})`,
    template: `%s — ${site.name}`,
  },
  description: site.tagline,
  keywords: [
    "ziti",
    "OnePlus Nord CE 3 5G",
    "custom ROM",
    "LineageOS",
    "crDroid",
    "flashing guide",
    "OOS 15.0.0.1301",
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — Custom ROMs for the ${site.device}`,
    description: site.tagline,
    images: ["/og.png"],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background text-fg">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <NavigationProgress />
        <SiteHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
