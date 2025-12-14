import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: 'https://vimnotion.com',
			lastModified: new Date('2025-12-01'),
			changeFrequency: 'yearly',
			priority: 1,
		},
		{
			url: 'https://vimnotion.com/docs/editor',
			lastModified: new Date('2025-12-14'),
			changeFrequency: 'yearly',
			priority: 0.9,
		},
		{
			url: 'https://vimnotion.com/docs/vim',
			lastModified: new Date('2025-12-14'),
			changeFrequency: 'yearly',
			priority: 0.9,
		},
		{
			url: 'https://vimnotion.com/docs/markdown',
			lastModified: new Date('2025-12-14'),
			changeFrequency: 'yearly',
			priority: 0.9,
		},

		{
			url: 'https://vimnotion.com/blog',
			lastModified: new Date('2025-12-02'),
			changeFrequency: 'weekly',
			priority: 0.7,
		},
		{
			url: 'https://vimnotion.com/blog/dear-vim',
			lastModified: new Date('2025-12-12'),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
		{
			url: 'https://vimnotion.com/blog/modern-day-folk-craft',
			lastModified: new Date('2025-12-10'),
			changeFrequency: 'monthly',
			priority: 0.8,
		},
	]
}
