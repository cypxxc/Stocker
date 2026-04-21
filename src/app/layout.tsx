import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Inventory",
  description: "Inventory / Stock Production system",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
