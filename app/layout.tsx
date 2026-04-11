import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "True Grade Transport - Fuel Cost Portal",
  description: "Fuel cost dashboard for True Grade Transport clients",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
