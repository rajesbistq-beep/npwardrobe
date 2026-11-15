import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "NP Wardrobe", template: "%s | NP Wardrobe" },
  description: "A considered wardrobe from NP Wardrobe.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
