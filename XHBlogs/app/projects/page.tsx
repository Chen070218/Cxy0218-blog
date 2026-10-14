import Navbar from '../../components/Navbar';
import ProjectsBoard from './ProjectsBoard';
import '../courses/courses.css';
import '../resources/resources.css';
export const metadata = { title: '项目文件夹' };
export default function ProjectsPage() { return <><Navbar/><ProjectsBoard/></>; }
