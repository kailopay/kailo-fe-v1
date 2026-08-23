import type { Metadata } from "next";
import { IBM_Plex_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "KailoPay",
    template: "%s · KailoPay",
  },
  description:
    "An Indonesia-first sandbox on-ramp: buy Stellar testnet XLM with rupiah through QRIS or a BRI virtual account.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/*
          THESIS: KailoPay is a printed star atlas for one money corridor: a
          monochrome proof-sheet system whose only figure is a compass,
          proving sandbox honesty can be the most crafted object in the room.
          It refuses the crypto gradient hero.
          OWN-WORLD: warm paper ground, ink scale, one brass accent, hairline
          chart rules, IBM Plex Mono annotations under Plus Jakarta Sans; the
          star compass plate with its plotted IDR-to-XLM bearing is
          recognizable with all copy removed.
          STORY: a developer sees the corridor plotted, believes the
          engineering is real because every claim sits beside a proving
          artifact, and signs in.
          FIRST VIEWPORT: masthead with sandbox stamp; the compass plate fills
          the left two thirds, bearing drawn from the IDR port to the XLM star
          over a horizon of status stars; headline right: "Rupiah in. Testnet
          XLM out."; the primary action fills brass.
          FORM: user-pinned fusion of the monochrome proof sheet and the star
          compass, roll seed 00a920e9 re-roll 1.
          FINISH: unreviewed and undocumented is unfinished; this build ends
          with the finish review, the verdict, DESIGN.md, and every shipping
          raster carrying its provenance
        */}
        {children}
      </body>
    </html>
  );
}
