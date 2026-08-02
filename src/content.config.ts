import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(['en', 'vi']),
    /** Shared key pairing translations of the same post. */
    key: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Posts sharing the same series name (within one language) get prev/next navigation. */
    series: z.string().optional(),
    /** Position within the series, 1-based. */
    seriesOrder: z.number().optional(),
  }),
});

export const collections = { blog };
