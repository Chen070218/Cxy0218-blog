import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FriendsBoard from "./FriendsBoard";
import { siteConfig } from "../../siteConfig";

export const metadata = {
  title: "友链 | " + siteConfig.title,
  description: "友链列表与交换链接的说明。",
};

export default function FriendsPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main className="w-[92%] md:w-[90%] max-w-4xl mx-auto mt-24 md:mt-28">
          <FriendsBoard />
        </main>
      </PageTransition>
    </div>
  );
}
