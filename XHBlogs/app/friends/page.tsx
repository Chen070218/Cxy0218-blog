import Navbar from "../../components/Navbar";
import PageTransition from "../../components/PageTransition";
import FriendsBoard from "./FriendsBoard";
import { siteConfig } from "../../siteConfig";

export const metadata = {
  title: "Friends | " + siteConfig.title,
  description: "Friend links and how to swap links.",
};

export default function FriendsPage() {
  return (
    <div className="min-h-screen relative pb-20">
      <Navbar />
      <PageTransition>
        <main id="main-content" className="w-[92%] md:w-[90%] max-w-4xl mx-auto mt-24 md:mt-28">
          <FriendsBoard />
        </main>
      </PageTransition>
    </div>
  );
}
