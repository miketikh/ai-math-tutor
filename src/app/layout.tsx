import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { ConversationProvider } from "@/contexts/ConversationContext";
import { AuthProvider } from "@/contexts/AuthContext";

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
  title: "Math Tutor - AI-Powered Learning Assistant",
  description: "An interactive AI-powered Socratic math tutor that helps you learn through guided questions and explanations.",
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
          <ConversationProvider>
            <div className="flex min-h-screen flex-col">
              {children}
            </div>
          </ConversationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
