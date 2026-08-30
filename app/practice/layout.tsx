import type { Metadata } from "next";

const title = "Practice Mode";
const description =
  "Drill scales, chords, triads and progressions on an interactive fretboard. Set the tempo, loop positions, and train your fretboard recall with a built-in sequencer.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/practice" },
  openGraph: {
    title: "Fret — Practice Mode",
    description,
    url: "/practice",
    siteName: "Fret",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fret — Practice Mode",
    description,
    creator: "@syedakmall",
  },
};

export default function PracticeLayout({ children }: LayoutProps<"/practice">) {
  return children;
}
