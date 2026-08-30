import type { Metadata } from "next";
import { Geist, Geist_Mono, VT323 } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const vt323 = VT323({
  weight: "400",
  variable: "--font-vt323",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fret — Guitar & Bass Scales, Chords, and Progressions",
  description: "An interactive, visual fretboard for guitar and bass players. Explore scales, modes, chord voicings, triads, and practice with a built-in sequencer. Built for standard, drop tunings, and extended range.",
  keywords: ["guitar fretboard", "bass fretboard", "guitar scales", "guitar chords", "interactive fretboard", "music theory", "learn guitar", "guitar practice tool", "fretboard visualization", "alternate tunings"],
  authors: [{ name: "Syed Akmal", url: "https://github.com/syedakmall" }],
  creator: "Syed Akmal",
  openGraph: {
    title: "Fret — Master the Fretboard",
    description: "Visualise scales, modes, chord voicings and progressions across guitar and bass necks.",
    url: "https://github.com/syedakmall/fret",
    siteName: "Fret",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fret — Master the Fretboard",
    description: "Visualise scales, modes, chord voicings and progressions across guitar and bass necks.",
    creator: "@syedakmall",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${vt323.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <footer className="mt-auto border-t-2 border-black bg-white py-6 text-center font-pixel text-xl text-black">
          built by{" "}
          <a
            href="https://github.com/syedakmall"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#ff3366] hover:underline"
          >
            syed akmal
          </a>
        </footer>
      </body>
    </html>
  );
}
