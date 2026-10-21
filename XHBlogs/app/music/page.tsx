import { siteConfig } from "@/siteConfig";
import MusicClient from "./MusicClient";

// 🌟 Server-rendered here, so metadata works properly
export const metadata = {
  title: "Music | " + siteConfig.title,
};

export default function MusicPage() {
  return (
    <>
      <h1 className="sr-only">Music</h1>
      <MusicClient />
    </>
  );
}