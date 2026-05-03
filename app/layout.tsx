import type { Metadata } from 'next';
import Providers from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Commenta.AI | Live AI Cricket Commentary',
  description: 'Real-time, ultra-low latency AI cricket commentary featuring 3D generative avatars, multi-device WebRTC sync, and emotional voice synthesis powered by Gemini 2.0 Flash.',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ['cricket', 'AI', 'commentary', 'live', 'real-time', 'Gemini'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          {children}
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
