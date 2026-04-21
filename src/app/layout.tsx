import type { Metadata } from "next";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const ibmPlex = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai",
  display: "swap",
});

export const metadata: Metadata = {
  title: "InvenThai — Stock Inventory",
  description: "ระบบบริหารคลังพัสดุ",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={ibmPlex.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster theme="dark" richColors />
      </body>
    </html>
  );
}
