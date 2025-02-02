import type { Metadata } from 'next';
import './globals.css';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

export const metadata: Metadata = {
  title: 'VeylaAI - Privacy-First AI Platform',
  description: 'Protect sensitive information in AI interactions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
