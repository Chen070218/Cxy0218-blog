import './courses.css';
import Navbar from '../../components/Navbar';
import CourseCalendar from './CourseCalendar';
import { siteConfig } from '../../siteConfig';
export const metadata = { title: 'Courses & Timetable | ' + siteConfig.title };
export default function CoursesPage() { return <><Navbar/><CourseCalendar/></>; }
