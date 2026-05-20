import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ModeProvider } from "@/lib/ModeContext";
import { LanguageProvider } from "@/lib/LanguageContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "MultiSkill",
  description: "Craft your future with community-driven learning roadmaps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-slate-900 bg-[#F8FAFC]`}>
        <AuthProvider>
          <LanguageProvider>
            <ModeProvider>
              {children}
            </ModeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
