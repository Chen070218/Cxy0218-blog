import { siteConfig } from '../../siteConfig';

export const metadata = { title: '创意工坊 | ' + siteConfig.title, description: '3D 模型与创意展示。' };

import { redirect } from 'next/navigation';
export default function RetiredPage() { redirect('/resources'); }
