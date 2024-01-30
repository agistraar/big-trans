import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '../context/AuthProvider';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';

export const metadata: Metadata = {
  title: 'Big Transaction',
  description: 'Aplikasi Manajemen Keuangan PT Borneo Inovasi Gemilang',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
