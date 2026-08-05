import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MIKAFAROZE — AI Content Marketing Platform',
  description:
    'AI-powered platform for IMAGE, VIDEO, SHORT FILM, and COPYWRITING. Buat konten marketing profesional dalam hitungan menit untuk bisnis Indonesia.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: 'oklch(0.205 0 0)',
              color: 'oklch(0.985 0 0)',
              borderRadius: '0.625rem',
            },
          }}
        />
      </body>
    </html>
  );
}
