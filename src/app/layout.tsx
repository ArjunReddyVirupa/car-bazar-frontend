import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/src/components/layout/Header";
import PWARegister from "@/src/components/PWARegister";

export const metadata: Metadata = {
  title: "Car Bazar | Quality Used Cars",
  description:
    "Browse verified pre-owned cars and contact our team for a test drive.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <PWARegister />
        <Header />
        {children}
      </body>
    </html>
  );
}
