import { siteConfig } from "../../siteConfig";
import PhotoWallClient from "./PhotoWallClient";

export const metadata = {
  title: "Photo Wall | " + siteConfig.title,
};

export default function PhotoWallPage() {
  return <PhotoWallClient />;
}