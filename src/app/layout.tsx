import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { SessionProvider } from "@/contexts/SessionContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata configuration for SEO and branding
export const metadata: Metadata = {
  title: "MathFoundry - AI-Powered Math Learning",
  description: "An AI tutor that finds gaps in your foundation, helps you fill them, and builds real understanding from the ground up.",
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon/apple-touch-icon.png',
  },
};

// Viewport configuration for responsive design
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <SessionProvider>
            <ConversationProvider>
              <div className="flex min-h-screen flex-col">
                {children}
              </div>
            </ConversationProvider>
          </SessionProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
