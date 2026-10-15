import fs from "fs";
import path from "path";
import matter from "gray-matter";
import CreativeWorkshopClient from "./CreativeWorkshopClient";
import { siteConfig } from "../../siteConfig";

export const metadata = {
  title: "创意工坊 | " + siteConfig.title,
  description: "3D 模型、炼金工坊与创意展示。",
};

/** 读取一个内容目录（posts / chatters / moments），整理成工坊需要的形状 */
function readCollection(dirName: string) {
  const dir = path.join(process.cwd(), dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
      const slug = file.replace(/\.md$/, "");
      return {
        slug,
        id: slug,
        title: String(data.title || slug),
        date: String(data.date || ""),
        description: String(data.description || ""),
        excerpt: content.replace(/[#*`>\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        cover: String(data.cover || siteConfig.defaultPostCover),
      };
    });
}

export default function TreePage() {
  const posts = readCollection("posts");
  const chatters = readCollection("chatters");
  const moments = readCollection("moments");

  return <CreativeWorkshopClient posts={posts} chatters={chatters} moments={moments} />;
}