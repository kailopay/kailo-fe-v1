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
          Consumer thesis: KailoPay is a soft exchange pocket for one clear
          corridor. The first screen makes the direction, amount, destination,
          and rate timing easy to read before the developer handoff.
          Developer routes keep their own denser workspace so sandbox tools
          stay useful without turning the consumer app into a console.
        */}
        {children}
      </body>
    </html>
  );
}
