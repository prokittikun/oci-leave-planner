import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OCI Leave Planner — Smart Leave Calculation',
  description:
    'Plan your leave with confidence. Calculate leave days, advance submission dates, and view team schedules with Thailand public holiday awareness.',
  keywords: ['leave planner', 'OCI', 'Thailand holidays', 'leave calculator'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
