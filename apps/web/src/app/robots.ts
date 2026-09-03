import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://everhere.org';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/mod', '/account', '/api/', '/login', '/register', '/forgot-password', '/reset-password'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
