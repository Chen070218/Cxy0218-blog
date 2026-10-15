import { siteConfig } from '../../siteConfig';

export const metadata = { title: '杂谈 | ' + siteConfig.title, description: '非正式的文章与脑洞记录。' };

import { redirect } from 'next/navigation';
export default function RetiredPage() { redirect('/resources'); }
