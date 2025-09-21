import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";
import SkipLink from "./components/SkipLink";
import OfflineIndicator from "./components/OfflineIndicator";
import { ToastProvider } from "./components/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Urban Blue Zone - Wellness Monitoring Dashboard",
  description: "Real-time wellness monitoring and Blue Zone habits tracking for urban communities",
  keywords: "wellness, blue zone, health monitoring, community, longevity, habits",
  authors: [{ name: "Urban Blue Zone Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  robots: "index, follow",
  openGraph: {
    title: "Urban Blue Zone - Wellness Monitoring Dashboard",
    description: "Real-time wellness monitoring and Blue Zone habits tracking for urban communities",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="color-scheme" content="light" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 h-full antialiased`}>
        <GlobalErrorBoundary>
          {/* Skip navigation for accessibility */}
          <SkipLink href="#main-content">Skip to main content</SkipLink>

          {/* Live region for screen reader announcements */}
          <div
            id="live-region"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />

          <Providers>
            <ToastProvider>
              <div id="main-content" className="min-h-full">
                {children}
              </div>
              <OfflineIndicator />
            </ToastProvider>
          </Providers>
        </GlobalErrorBoundary>
      </body>
    </html>
  );
}
