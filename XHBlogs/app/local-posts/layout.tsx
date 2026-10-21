import { siteConfig } from '../../siteConfig';

export const metadata = { title: 'Local Drafts | ' + siteConfig.title };

export default function LocalPostsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
