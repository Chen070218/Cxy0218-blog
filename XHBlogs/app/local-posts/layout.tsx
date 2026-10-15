import { siteConfig } from '../../siteConfig';

export const metadata = { title: '本地归档 | ' + siteConfig.title };

export default function LocalPostsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
