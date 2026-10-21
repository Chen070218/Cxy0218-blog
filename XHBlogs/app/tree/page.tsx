import fs from "fs";
import path from "path";
import matter from "gray-matter";
import CreativeWorkshopClient from "./CreativeWorkshopClient";
import { siteConfig } from "../../siteConfig";

export const metadata = {
  title: "Creative Workshop | " + siteConfig.title,
  description: "3D models, an alchemy lab and a few creative experiments.",
};

/** Read a content directory (posts / chatters / moments) into the shape the workshop needs */
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