import { MetadataRoute } from 'next';

const URL = 'https://losslessleap.netlify.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    '/',
    '/image-compressor',
    '/image-converter',
    '/image-to-pdf',
    '/compress-pdf',
    '/pdf-merger',
    '/scan-to-pdf',
    '/protect-pdf',
  ];

  return routes.map((route) => ({
    url: `${URL}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: route === '/' ? 1 : 0.8,
  }));
}
