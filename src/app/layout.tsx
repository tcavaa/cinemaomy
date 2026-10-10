import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Newsreader,
  Noto_Sans_Georgian,
  Noto_Serif_Display,
  Noto_Serif_Georgian,
} from "next/font/google";
import "./globals.css";

const displaySerif = Noto_Serif_Display({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-display-serif",
});

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
});

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
});

// Georgian glyphs for titles like "იქ, სადაც სახლია"; only downloaded when used.
const georgianSerif = Noto_Serif_Georgian({
  subsets: ["georgian"],
  axes: ["wdth"],
  variable: "--font-ka-serif",
  preload: false,
});

const georgianSans = Noto_Sans_Georgian({
  subsets: ["georgian"],
  axes: ["wdth"],
  variable: "--font-ka-sans",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Cinema O'my — a thirty-seat cinema in Tbilisi",
    template: "%s — Cinema O'my",
  },
  description:
    "Thirty leather seats, one screen. Classics, festival films and premieres on Saint Petersburg Street, Tbilisi. Pick your seat and book online.",
  applicationName: "Cinema O'my",
  openGraph: {
    type: "website",
    siteName: "Cinema O'my",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#ede4d3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const fonts = [displaySerif, archivo, newsreader, georgianSerif, georgianSans].map((f) => f.variable).join(" ");
  return (
    <html lang="en" data-scroll-behavior="smooth" className={fonts}>
      <body>{children}</body>
    </html>
  );
}
