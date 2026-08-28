import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "KailoPay",
    template: "%s | KailoPay",
  },
  description:
    "An Indonesia-first sandbox on-ramp: buy Stellar testnet XLM with rupiah through QRIS or a BRI virtual account.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {/*
          Visual contract: the exchange is the product, not a dashboard. The
          consumer surface uses cool white, navy ink, cobalt action, mint sell,
          and violet testnet cues around one focused exchange card. Developer
          routes keep a denser workbench for sandbox tools, API keys, and order
          recovery.
        */}
        {children}
      </body>
    </html>
  );
}
