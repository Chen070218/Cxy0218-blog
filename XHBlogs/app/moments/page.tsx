import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import MomentList from './MomentList';
import { siteConfig } from '../../siteConfig';

export const metadata = {
  title: "Moments | " + siteConfig.title,
  description: "Life updates and captured moments",
};

export default function MomentsPage() {
  let allMoments: any[] = [];

  try {
    // 🌟 Ultimate no-miss trick: scan both possible folders so every moment gets picked up!
    const possibleDirs = [
      path.join(process.cwd(), 'posts', 'moments'),
      path.join(process.cwd(), 'moments')
    ];

    possibleDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        const fileNames = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
        fileNames.forEach(fileName => {
          const fullPath = path.join(dir, fileName);
          const { data, content } = matter(fs.readFileSync(fullPath, 'utf8'));

          allMoments.push({
            id: fileName.replace(/\.md$/, ''),
            date: data.date || '1970-01-01',
            location: data.location || '',
            images: data.images || [],
            content: content.trim()
          });
        });
      }
    });

    // Deduplicate, in case the same file name ended up in both folders
    allMoments = Array.from(new Map(allMoments.map(item => [item.id, item])).values());

  } catch (e) {
    console.error("Failed to read moments data:", e);
  }

  return (
    <div className="min-h-screen relative pb-10 flex flex-col">
      <Navbar />
      <PageTransition className="flex-1 flex flex-col">
        <main id="main-content">
          <MomentList
            moments={allMoments}
            authorName={siteConfig.authorName}
            avatarUrl={siteConfig.avatarUrl}
          />
        </main>
      </PageTransition>
    </div>
  );
}