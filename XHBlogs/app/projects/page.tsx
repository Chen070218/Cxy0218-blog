import Navbar from '../../components/Navbar';
import ProjectsBoard from './ProjectsBoard';
import '../courses/courses.css';
import '../resources/resources.css';
export const metadata = { title: 'Projects' };
export default function ProjectsPage() { return <><Navbar/><ProjectsBoard/></>; }
