import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: {
    default: 'TradeBoard X — AI Powered Smart Trading Dashboard',
    template: '%s | TradeBoard X',
  },
  description: 'Professional AI-powered trading intelligence platform for crypto, forex, and stock traders. Track, analyze and optimize your trading performance.',
  keywords: ['trading dashboard', 'AI trading', 'crypto trading', 'trade analytics', 'portfolio tracker'],
  authors: [{ name: 'TradeBoard X' }],
};

export const viewport: Viewport = {
  themeColor: '#00E5FF',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-background antialiased">
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
