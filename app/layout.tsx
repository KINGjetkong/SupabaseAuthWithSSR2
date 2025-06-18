import React, { type ReactNode } from 'react';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import Footer from '@/app/components/ui/Footer/Footer';
import { getSession } from '@/lib/server/supabase';
import NavBar from '@/app/components/ui/Navbar/TopBar';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { Toaster } from '@/components/ui/sonner';

import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  adjustFontFallback: false,
  variable: '--font-poppins'
});
export const metadata: Metadata = {
  metadataBase: new URL('https://mdevidence.ai/'),
  title: 'MDevidence.ai',
  description:
    'MDevidence.ai demonstrates server-side rendering with Supabase authentication and AI integrations.'
};

export default function RootLayout({
  children,
  modal
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* We pass the promise here and resolve it with react.use in the child to prevent the async request from blocking the UI */}
          <NavBar session={getSession()} />
          <main>{children}</main>
          <Toaster />
          {modal}
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
