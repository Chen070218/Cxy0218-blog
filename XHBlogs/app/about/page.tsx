import { siteConfig } from '../../siteConfig';

export const metadata = { title: 'About Me | ' + siteConfig.title, description: siteConfig.bio };

// src/app/about/page.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // 🌟 import GFM for ~~strikethrough~~
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';

// Import the syntax highlighting theme
import 'highlight.js/styles/atom-one-dark.css';
import 'katex/dist/katex.min.css';

import Navbar from '../../components/Navbar';
import PageTransition from '../../components/PageTransition';
import AboutClient from '../../components/AboutClient';
import { Suspense } from 'react';

function getDirActivities(dirName: string, typeLabel: 'post' | 'musing' | 'moment', linkPrefix: string) {
  const dirPath = path.join(process.cwd(), dirName);
  if (!fs.existsSync(dirPath)) return [];

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));

  return files.map(file => {
    const content = fs.readFileSync(path.join(dirPath, file), 'utf8');
    const { data } = matter(content);
    return {
      id: `${dirName}-${file}`,
      type: typeLabel,
      title: data.title || file.replace('.md', ''),
      date: data.date ? new Date(data.date).toISOString() : '1970-01-01T00:00:00Z',
      url: `/${linkPrefix}/${file.replace('.md', '')}`
    };
  });
}

export default async function AboutPage() {
  const fullPath = path.join(process.cwd(), 'app', 'about', 'about.md');
  let contentHtml = "I'm too lazy to write an introduction here yet...";
  let coverImage = "/photos/8e72bb847bdc.webp";

  try {
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    // 🌟 use let so the text can be pre-cleaned
    let { data, content } = matter(fileContents);
    if (data.cover) coverImage = data.cover;

    // ==========================================
    // 🌟 pre-parse text clean-up
    // ==========================================
    // 1. Force the cpp tag onto code blocks with no language label, so detection does not fail
    content = content.replace(/^```\s*$/gm, '```cpp');
    // 2. Fix numbered lists that fail to render because the space after the dot is missing (1.Baidu -> 1. Baidu)
    content = content.replace(/^(\s*\d+)\.([^ \n])/gm, '$1. $2');

    // 3. 🌟 Rescue the "consecutive blank lines" the Markdown engine swallows (same trick as the public post page)
    content = content.replace(/\r\n/g, '\n').replace(/^[ \t]+$/gm, '');
    const blocks = content.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~)/g);
    content = blocks.map((block, index) => {
      if (index % 2 === 1) return block; // never touch code blocks
      return block.replace(/\n{3,}/g, (match) => {
        const brCount = match.length - 2;
        return '\n\n' + '<br>'.repeat(brCount) + '\n\n';
      });
    }).join('');
    // ==========================================

    const processedContent = await unified()
      .use(remarkParse)
      .use(remarkGfm) // 🌟 mount the GFM parser
      .use(remarkMath)
      .use(remarkRehype, { allowDangerousHtml: true })
      // 🌟 key fix: turn on automatic language detection and limit it to a language whitelist
      // @ts-ignore
      .use(rehypeHighlight, {
        detect: true,
        ignoreMissing: true,
        subset: ['cpp', 'c', 'python', 'java', 'javascript', 'typescript', 'go', 'rust', 'bash', 'json', 'html', 'css', 'sql', 'xml']
      })
      .use(rehypeKatex)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(content);

    contentHtml = processedContent.toString();
  } catch (e) {
    console.error("Failed to read about.md", e);
  }

  const posts = getDirActivities('posts', 'post', 'posts');
  const moments = getDirActivities('moments', 'moment', 'moments');

  const allActivities = [...posts, ...moments].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="w-[95%] md:w-[90%] max-w-4xl mx-auto mt-24 md:mt-28 relative z-10">

          {/* 🌟 Prose styles used only on the About page */}
          <style dangerouslySetInnerHTML={{ __html: `
            .prose h1 { font-size: 1.8rem !important; font-weight: 900 !important; margin-bottom: 1.2rem !important; margin-top: 2rem !important; line-height: 1.3 !important; color: inherit !important; }
            .prose h2 { font-size: 1.5rem !important; font-weight: 800 !important; margin-bottom: 1rem !important; margin-top: 1.5rem !important; color: inherit !important; }
            .prose h3 { font-size: 1.2rem !important; font-weight: 700 !important; margin-bottom: 0.8rem !important; color: inherit !important; }
            .prose p { font-size: 0.95rem !important; line-height: 1.75 !important; color: inherit !important; }
            
            .prose a { color: #6366f1 !important; text-decoration: none !important; font-weight: 600 !important; border-bottom: 1px dashed #6366f1 !important; transition: all 0.3s ease !important; }
            .prose a:hover { color: #4f46e5 !important; border-bottom-style: solid !important; background-color: rgba(99, 102, 241, 0.1) !important; padding: 0 0.2rem !important; border-radius: 0.2rem !important; }
            .dark .prose a { color: #818cf8 !important; border-bottom-color: #818cf8 !important; }
            .dark .prose a:hover { color: #a5b4fc !important; background-color: rgba(129, 140, 248, 0.15) !important; }

            .prose ul { list-style-type: disc !important; padding-left: 1.5rem !important; font-size: 0.95rem !important; }
            .prose ol { list-style-type: decimal !important; padding-left: 1.5rem !important; font-size: 0.95rem !important; }
            .prose li { display: list-item !important; margin-bottom: 0.5rem !important; }
            
            .prose ul ul, .prose ol ul { list-style-type: circle !important; margin-top: 0.25rem !important; margin-bottom: 0.25rem !important; }
            .prose ol ol, .prose ul ol { list-style-type: lower-alpha !important; margin-top: 0.25rem !important; margin-bottom: 0.25rem !important; }
            
            /* 🌟 force strikethrough to show */
            .prose s, .prose del { text-decoration-line: line-through !important; opacity: 0.6; }

            /* 🌟 jelly-geek style patch for blockquotes */
            .prose blockquote {
              border-left: 4px solid #6366f1 !important;
              background-color: rgba(99, 102, 241, 0.05) !important;
              padding: 1rem 1.5rem !important;
              margin: 1.5rem 0 !important;
              border-radius: 0 1.25rem 1.25rem 0 !important;
              font-style: italic !important;
              color: #64748b !important;
              quotes: none !important; /* force-remove Tailwind's ugly default quotes */
            }
            .prose blockquote p {
              margin: 0 !important; 
              color: inherit !important;
            }
            /* 🌟 kill the pseudo-element quotes Tailwind Typography adds before and after */
            .prose blockquote p::before,
            .prose blockquote p::after {
              display: none !important;
              content: none !important;
            }
            
            .dark .prose blockquote {
              border-left-color: #818cf8 !important;
              background-color: rgba(129, 140, 248, 0.1) !important;
              color: #94a3b8 !important;
            }
            
            /* 🌟 jelly-geek code font: rounder and fuller, large radius everywhere */
            .prose pre {
              background-color: #282c34 !important; color: #abb2bf !important;
              padding: 1rem !important; border-radius: 1.25rem !important;
              overflow-x: auto !important; box-shadow: inset 0 0 10px rgba(0,0,0,0.3) !important;
              margin-top: 1rem !important; margin-bottom: 1rem !important;
            }
            
            .prose pre code, .prose p code, .prose li code { 
              font-family: ui-rounded, 'Quicksand', 'Nunito', 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace !important;
              font-variant-ligatures: contextual !important;
              font-weight: 500 !important;
              letter-spacing: 0.02em !important;
            }
            
            .prose pre code { 
              background-color: transparent !important; 
              padding: 0 !important; 
              color: inherit !important; 
              font-size: 0.85em !important; 
            }
            
            .prose code::before, .prose code::after { content: none !important; }
            
            .prose p code, .prose li code { 
              background-color: rgba(99, 102, 241, 0.1) !important; color: #6366f1 !important; 
              padding: 0.2rem 0.4rem !important; border-radius: 0.5rem !important; font-size: 0.85em !important; 
            }
            .dark .prose p code, .dark .prose li code { background-color: rgba(99, 102, 241, 0.2) !important; color: #818cf8 !important; }
            
            /* 🌟 make sure the generated <br> takes up real vertical space */
            .prose br { display: block !important; content: "" !important; margin-top: 0.5em !important; }

            .prose img { display: block !important; margin: 1.5rem auto !important; border-radius: 1rem !important; box-shadow: 0 10px 30px rgba(0,0,0,0.1) !important; max-width: 100% !important; height: auto !important; }

            /* 🌟 Atom One Dark patch */
            .prose pre code .hljs-comment, .prose pre code .hljs-quote { color: #5c6370 !important; font-style: italic !important; }
            .prose pre code .hljs-doctag, .prose pre code .hljs-keyword, .prose pre code .hljs-formula { color: #c678dd !important; }
            .prose pre code .hljs-keyword.type_, .prose pre code .hljs-type { color: #c678dd !important; } 
            .prose pre code .hljs-section, .prose pre code .hljs-name, .prose pre code .hljs-selector-tag, .prose pre code .hljs-deletion, .prose pre code .hljs-subst { color: #e06c75 !important; }
            .prose pre code .hljs-literal { color: #56b6c2 !important; }
            .prose pre code .hljs-string, .prose pre code .hljs-regexp, .prose pre code .hljs-addition, .prose pre code .hljs-attribute, .prose pre code .hljs-meta-string { color: #98c379 !important; }
            .prose pre code .hljs-built_in, .prose pre code .hljs-class .hljs-title, .prose pre code .hljs-title.class_ { color: #e6c07b !important; } 
            .prose pre code .hljs-attr, .prose pre code .hljs-variable, .prose pre code .hljs-template-variable, .prose pre code .hljs-selector-class, .prose pre code .hljs-selector-attr, .prose pre code .hljs-selector-pseudo, .prose pre code .hljs-number { color: #d19a66 !important; }
            .prose pre code .hljs-symbol, .prose pre code .hljs-bullet, .prose pre code .hljs-link, .prose pre code .hljs-meta, .prose pre code .hljs-selector-id, .prose pre code .hljs-title, .prose pre code .hljs-title.function_ { color: #61aeee !important; } 

            @media (min-width: 768px) {
              .prose h1 { font-size: 3rem !important; font-weight: 950 !important; margin-bottom: 2rem !important; margin-top: 3rem !important; line-height: 1.1 !important; }
              .prose h2 { font-size: 2.2rem !important; margin-bottom: 1.5rem !important; margin-top: 2rem !important; }
              .prose h3 { font-size: 1.5rem !important; margin-bottom: 1rem !important; }
              .prose p { font-size: 1.15rem !important; line-height: 1.85 !important; }
              
              .prose ul, .prose ol { padding-left: 2rem !important; font-size: 1.1rem !important; }
              
              .prose pre { padding: 1.25rem !important; margin-top: 1.5rem !important; margin-bottom: 1.5rem !important; border-radius: 1.5rem !important; }
              .prose pre code { font-size: 0.9em !important; }
              .prose p code, .prose li code { padding: 0.2rem 0.4rem !important; font-size: 0.9em !important; border-radius: 0.375rem !important;}
              .prose img { margin: 2rem auto !important; border-radius: 2rem !important; box-shadow: 0 20px 50px rgba(0,0,0,0.15) !important; }
            }
          `}} />

          <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-500 font-bold animate-pulse"><h1 className="sr-only">About Me</h1>Loading profile...</div>}>
            {/* 🌟 component left untouched */}
            <AboutClient
              contentHtml={contentHtml}
              coverImage={coverImage}
              activities={allActivities}
            />
          </Suspense>
        </main>
      </PageTransition>
    </div>
  );
}