import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin", "latin-ext"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: { default: "Donna — Kombini gör. Bedenini bil.", template: "%s · Donna" },
  description: "Gerçek insanlar, gerçek kıyafetler, aldıkları beden. Sana benzeyen vücutlarda kıyafetin nasıl durduğunu gör.",
  applicationName: "Donna",
  appleWebApp: { capable: true, title: "Donna", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#F5F0EA",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${dmSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
