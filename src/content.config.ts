import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
    minutes: z.number(),
    icon: z.string(),
    tag: z.string().optional(),
    // When the content was last checked against today's assistants (they change fast).
    reviewed: z.coerce.date(),
    // Bonus lessons are listed but don't count towards course progress.
    optional: z.boolean().optional(),
  }),
});

export const collections = { lessons };
