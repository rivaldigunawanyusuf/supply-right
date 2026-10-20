import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ViewModeProvider } from '@/context/ViewModeContext';

export const metadata: Metadata = {
  title: 'SupplyRight AI — Autonomous On-Chain Protection & Settlement Engine',
  description:
    'Enterprise B2B trade protection and policy-gated autonomous settlement on Ethereum Sepolia for global supply chains.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
        <ThemeProvider>
          <AuthProvider>
            <ViewModeProvider>
              {children}
            </ViewModeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
