import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HoverMethod Junior — Foundation in Drone Technology | Class 7–12',
  description:
    'A live online drone technology foundation programme for Class 7–12. 7 days × 2 hours. ₹2,249. Optional practical add-ons available. Senrysa CoE at IIT Research Park.',
  openGraph: {
    title: 'HoverMethod Junior — Foundation in Drone Technology',
    description:
      '7 days live online drone tech learning for Class 7–12. Starting ₹2,249. Optional hands-on practical and IIT Research Park CoE experience available.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}