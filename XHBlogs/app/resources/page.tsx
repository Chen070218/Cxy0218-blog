import Navbar from '../../components/Navbar';
import ResourceLibrary from './ResourceLibrary';
import { studyResources } from '../../data/resources';
import '../courses/courses.css';
import './resources.css';

export const metadata = { title: '学习资料' };
export default function ResourcesPage() {
  return <><Navbar /><ResourceLibrary initialItems={studyResources} /></>;
}
