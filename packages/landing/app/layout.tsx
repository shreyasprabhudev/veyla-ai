import type { Metadata } from 'next';
import './globals.css';

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
      <body className="bg-gray-50">{children}</body>
    </html>
  );
}
