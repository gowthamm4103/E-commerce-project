import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Engineers Fashion',
  description: 'Premium fashion for engineers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
