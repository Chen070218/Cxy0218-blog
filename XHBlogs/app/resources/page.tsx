import { siteConfig } from '../../siteConfig';
import Navbar from '../../components/Navbar';
import ResourceLibrary from './ResourceLibrary';
import { studyResources } from '../../data/resources';
import '../courses/courses.css';
import './resources.css';

export const metadata = { title: 'Resources | ' + siteConfig.title, description: 'The study sites I use, organized by course and topic.' };
export default function ResourcesPage() {
  return <><Navbar /><ResourceLibrary initialItems={studyResources} /></>;
}
