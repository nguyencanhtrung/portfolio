import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  const posts = (await getCollection('blog', (p) => !p.data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: 'Canh-Trung Nguyen',
    description:
      'Perspectives on connected driving, robotics, AI and the systems behind them.',
    site: context.site,
    items: posts.map((post) => {
      const slug = post.id.replace(/^(en|vi)\//, '');
      const prefix = post.data.lang === 'vi' ? '/vi' : '';
      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.date,
        link: `${prefix}/blog/${slug}/`,
      };
    }),
  });
}
