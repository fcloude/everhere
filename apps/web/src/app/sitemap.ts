import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everhere.org';

  const publicPages = [
    '',
    '/about',
    '/how-it-works',
    '/community',
    '/contributors',
    '/privacy',
    '/security',
    '/security/report',
    '/roadmap',
    '/feedback',
    '/contribute',
  ];

  return publicPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/contribute' ? 0.9 : path === '/contributors' ? 0.8 : 0.7,
  }));
}
