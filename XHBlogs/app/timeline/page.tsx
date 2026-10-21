import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import { siteConfig } from '../../siteConfig';
import TimelineClient from '../../components/TimelineClient';
// 🌟 1. import ToastProvider
import { ToastProvider } from '../../components/ToastProvider';

export const metadata = {
  title: "Timeline | " + siteConfig.title,
};

export default function Timeline() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  let posts: any[] = [];
  let tagCounts: Record<string, number> = {};

  try {
    if (fs.existsSync(postsDirectory)) {
      const fileNames = fs.readdirSync(postsDirectory).filter(f => f.endsWith('.md'));

      fileNames.forEach(fileName => {
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data } = matter(fileContents);

        const postTags = data.tags && Array.isArray(data.tags) ? data.tags : ['Uncategorized'];

        postTags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });

        posts.push({
          slug,
          title: data.title || 'Untitled',
          date: data.date || '1970-01-01',
          description: data.description || '',
          tags: postTags,
          cover: data.cover || siteConfig.defaultPostCover,
        });
      });

      posts.sort((a, b) => {
        const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return dateDiff !== 0 ? dateDiff : b.slug.localeCompare(a.slug);
      });
    }
  } catch(e) {
    console.error("Failed to read the post list", e);
  }

  const tagsArray = Object.keys(tagCounts)
    .map(name => ({ name, count: tagCounts[name] }))
    .sort((a, b) => b.count - a.count);

  return (
    // 🌟 2. wrap the whole page in ToastProvider at the outermost level
    <ToastProvider>
      <div className="min-h-screen relative pb-32">
        <Navbar />
        <PageTransition>
          <main id="main-content">
            <TimelineClient posts={posts} tags={tagsArray} />
          </main>
        </PageTransition>
      </div>
    </ToastProvider>
  );
}