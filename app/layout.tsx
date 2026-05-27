import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";
import { ModeProvider } from "@/lib/ModeContext";
import { LanguageProvider } from "@/lib/LanguageContext";
import Script from "next/script";
import AOSInit from "@/components/AOSInit";

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
      <head>
        <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased text-slate-900`}>
        <AuthProvider>
          <LanguageProvider>
            <ModeProvider>
              <AOSInit />
              {children}
            </ModeProvider>
          </LanguageProvider>
        </AuthProvider>

        <Script 
          src="https://unpkg.com/aos@2.3.1/dist/aos.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

