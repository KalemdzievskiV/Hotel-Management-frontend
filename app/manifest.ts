import type { MetadataRoute } from 'next';

/** Lets the web app be added to a phone's home screen, which iPhones need for push notifications */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hotel Manager',
    short_name: 'Hotel Manager',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#111827',
    icons: [
      { src: '/pwa-icon/192', sizes: '192x192', type: 'image/png' },
      { src: '/pwa-icon/512', sizes: '512x512', type: 'image/png' },
    ],
  };
}
